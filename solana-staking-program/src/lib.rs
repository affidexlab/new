use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer, Mint};

declare_id!("VDMStakingProgramXXXXXXXXXXXXXXXXXXXXXXXXXX");

const MIN_STAKE_AMOUNT: u64 = 1_000_000_000_000;
const MAX_STAKE_AMOUNT: u64 = 10_000_000_000_000_000;
const DEPOSIT_FEE_BPS: u64 = 250;
const WITHDRAWAL_FEE_BPS: u64 = 150;
const BASIS_POINTS: u64 = 10_000;

const SIX_MONTHS_SECONDS: i64 = 15_768_000;
const NINE_MONTHS_SECONDS: i64 = 23_652_000;
const TWELVE_MONTHS_SECONDS: i64 = 31_536_000;

#[program]
pub mod vdm_staking {
    use super::*;

    pub fn initialize(
        ctx: Context<Initialize>,
        rewards_pool_amount: u64,
    ) -> Result<()> {
        let staking_pool = &mut ctx.accounts.staking_pool;
        staking_pool.authority = ctx.accounts.authority.key();
        staking_pool.vdm_mint = ctx.accounts.vdm_mint.key();
        staking_pool.vault = ctx.accounts.vault.key();
        staking_pool.rewards_vault = ctx.accounts.rewards_vault.key();
        staking_pool.fee_wallet = ctx.accounts.fee_wallet.key();
        staking_pool.total_staked = 0;
        staking_pool.total_rewards_distributed = 0;
        staking_pool.rewards_pool_remaining = rewards_pool_amount;
        staking_pool.total_stakers = 0;
        staking_pool.bump = ctx.bumps.staking_pool;

        Ok(())
    }

    pub fn stake(
        ctx: Context<Stake>,
        amount: u64,
        lock_period: LockPeriod,
    ) -> Result<()> {
        require!(amount >= MIN_STAKE_AMOUNT, ErrorCode::AmountTooLow);
        require!(amount <= MAX_STAKE_AMOUNT, ErrorCode::AmountTooHigh);
        require!(!ctx.accounts.user_stake.has_staked, ErrorCode::AlreadyStaked);

        let deposit_fee = amount.checked_mul(DEPOSIT_FEE_BPS)
            .unwrap()
            .checked_div(BASIS_POINTS)
            .unwrap();
        
        let net_stake_amount = amount.checked_sub(deposit_fee).unwrap();

        let clock = Clock::get()?;
        let lock_duration = match lock_period {
            LockPeriod::SixMonths => SIX_MONTHS_SECONDS,
            LockPeriod::NineMonths => NINE_MONTHS_SECONDS,
            LockPeriod::TwelveMonths => TWELVE_MONTHS_SECONDS,
        };

        let apy_bps = match lock_period {
            LockPeriod::SixMonths => 800,
            LockPeriod::NineMonths => 1200,
            LockPeriod::TwelveMonths => 1600,
        };

        let rewards = net_stake_amount
            .checked_mul(apy_bps)
            .unwrap()
            .checked_div(BASIS_POINTS)
            .unwrap();

        let staking_pool = &mut ctx.accounts.staking_pool;
        require!(
            rewards <= staking_pool.rewards_pool_remaining,
            ErrorCode::InsufficientRewards
        );

        token::transfer(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.user_token_account.to_account_info(),
                    to: ctx.accounts.vault.to_account_info(),
                    authority: ctx.accounts.user.to_account_info(),
                },
            ),
            net_stake_amount,
        )?;

        if deposit_fee > 0 {
            token::transfer(
                CpiContext::new(
                    ctx.accounts.token_program.to_account_info(),
                    Transfer {
                        from: ctx.accounts.user_token_account.to_account_info(),
                        to: ctx.accounts.fee_wallet.to_account_info(),
                        authority: ctx.accounts.user.to_account_info(),
                    },
                ),
                deposit_fee,
            )?;
        }

        let user_stake = &mut ctx.accounts.user_stake;
        user_stake.user = ctx.accounts.user.key();
        user_stake.amount_staked = net_stake_amount;
        user_stake.rewards_allocated = rewards;
        user_stake.lock_period = lock_period;
        user_stake.start_timestamp = clock.unix_timestamp;
        user_stake.unlock_timestamp = clock.unix_timestamp + lock_duration;
        user_stake.has_staked = true;
        user_stake.has_claimed = false;
        user_stake.bump = ctx.bumps.user_stake;

        staking_pool.total_staked += net_stake_amount;
        staking_pool.rewards_pool_remaining -= rewards;
        staking_pool.total_stakers += 1;

        emit!(StakeEvent {
            user: ctx.accounts.user.key(),
            amount: net_stake_amount,
            rewards_allocated: rewards,
            lock_period,
            unlock_timestamp: user_stake.unlock_timestamp,
        });

        Ok(())
    }

    pub fn claim(ctx: Context<Claim>) -> Result<()> {
        let user_stake = &mut ctx.accounts.user_stake;
        require!(user_stake.has_staked, ErrorCode::NoActiveStake);
        require!(!user_stake.has_claimed, ErrorCode::AlreadyClaimed);

        let clock = Clock::get()?;
        require!(
            clock.unix_timestamp >= user_stake.unlock_timestamp,
            ErrorCode::StillLocked
        );

        let withdrawal_fee = user_stake.amount_staked
            .checked_mul(WITHDRAWAL_FEE_BPS)
            .unwrap()
            .checked_div(BASIS_POINTS)
            .unwrap();

        let net_principal = user_stake.amount_staked.checked_sub(withdrawal_fee).unwrap();
        let total_return = net_principal + user_stake.rewards_allocated;

        let staking_pool = &ctx.accounts.staking_pool;
        let seeds = &[
            b"staking_pool",
            &[staking_pool.bump],
        ];
        let signer = &[&seeds[..]];

        token::transfer(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.vault.to_account_info(),
                    to: ctx.accounts.user_token_account.to_account_info(),
                    authority: staking_pool.to_account_info(),
                },
                signer,
            ),
            net_principal,
        )?;

        token::transfer(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.rewards_vault.to_account_info(),
                    to: ctx.accounts.user_token_account.to_account_info(),
                    authority: staking_pool.to_account_info(),
                },
                signer,
            ),
            user_stake.rewards_allocated,
        )?;

        if withdrawal_fee > 0 {
            token::transfer(
                CpiContext::new_with_signer(
                    ctx.accounts.token_program.to_account_info(),
                    Transfer {
                        from: ctx.accounts.vault.to_account_info(),
                        to: ctx.accounts.fee_wallet.to_account_info(),
                        authority: staking_pool.to_account_info(),
                    },
                    signer,
                ),
                withdrawal_fee,
            )?;
        }

        user_stake.has_claimed = true;

        let staking_pool = &mut ctx.accounts.staking_pool;
        staking_pool.total_rewards_distributed += user_stake.rewards_allocated;

        emit!(ClaimEvent {
            user: ctx.accounts.user.key(),
            principal_returned: net_principal,
            rewards_paid: user_stake.rewards_allocated,
            total_return,
        });

        Ok(())
    }

    pub fn get_stake_info(ctx: Context<GetStakeInfo>) -> Result<()> {
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + StakingPool::LEN,
        seeds = [b"staking_pool"],
        bump
    )]
    pub staking_pool: Account<'info, StakingPool>,

    #[account(mut)]
    pub authority: Signer<'info>,

    pub vdm_mint: Account<'info, Mint>,

    #[account(
        init,
        payer = authority,
        token::mint = vdm_mint,
        token::authority = staking_pool,
        seeds = [b"vault"],
        bump
    )]
    pub vault: Account<'info, TokenAccount>,

    #[account(
        init,
        payer = authority,
        token::mint = vdm_mint,
        token::authority = staking_pool,
        seeds = [b"rewards_vault"],
        bump
    )]
    pub rewards_vault: Account<'info, TokenAccount>,

    #[account(mut)]
    pub fee_wallet: Account<'info, TokenAccount>,

    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct Stake<'info> {
    #[account(
        mut,
        seeds = [b"staking_pool"],
        bump = staking_pool.bump
    )]
    pub staking_pool: Account<'info, StakingPool>,

    #[account(
        init,
        payer = user,
        space = 8 + UserStake::LEN,
        seeds = [b"user_stake", user.key().as_ref()],
        bump
    )]
    pub user_stake: Account<'info, UserStake>,

    #[account(mut)]
    pub user: Signer<'info>,

    #[account(
        mut,
        constraint = user_token_account.owner == user.key(),
        constraint = user_token_account.mint == staking_pool.vdm_mint
    )]
    pub user_token_account: Account<'info, TokenAccount>,

    #[account(
        mut,
        seeds = [b"vault"],
        bump
    )]
    pub vault: Account<'info, TokenAccount>,

    #[account(mut)]
    pub fee_wallet: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Claim<'info> {
    #[account(
        mut,
        seeds = [b"staking_pool"],
        bump = staking_pool.bump
    )]
    pub staking_pool: Account<'info, StakingPool>,

    #[account(
        mut,
        seeds = [b"user_stake", user.key().as_ref()],
        bump = user_stake.bump,
        constraint = user_stake.user == user.key()
    )]
    pub user_stake: Account<'info, UserStake>,

    #[account(mut)]
    pub user: Signer<'info>,

    #[account(
        mut,
        constraint = user_token_account.owner == user.key(),
        constraint = user_token_account.mint == staking_pool.vdm_mint
    )]
    pub user_token_account: Account<'info, TokenAccount>,

    #[account(
        mut,
        seeds = [b"vault"],
        bump
    )]
    pub vault: Account<'info, TokenAccount>,

    #[account(
        mut,
        seeds = [b"rewards_vault"],
        bump
    )]
    pub rewards_vault: Account<'info, TokenAccount>,

    #[account(mut)]
    pub fee_wallet: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct GetStakeInfo<'info> {
    #[account(
        seeds = [b"user_stake", user.key().as_ref()],
        bump = user_stake.bump
    )]
    pub user_stake: Account<'info, UserStake>,

    pub user: Signer<'info>,
}

#[account]
pub struct StakingPool {
    pub authority: Pubkey,
    pub vdm_mint: Pubkey,
    pub vault: Pubkey,
    pub rewards_vault: Pubkey,
    pub fee_wallet: Pubkey,
    pub total_staked: u64,
    pub total_rewards_distributed: u64,
    pub rewards_pool_remaining: u64,
    pub total_stakers: u32,
    pub bump: u8,
}

impl StakingPool {
    pub const LEN: usize = 32 + 32 + 32 + 32 + 32 + 8 + 8 + 8 + 4 + 1;
}

#[account]
pub struct UserStake {
    pub user: Pubkey,
    pub amount_staked: u64,
    pub rewards_allocated: u64,
    pub lock_period: LockPeriod,
    pub start_timestamp: i64,
    pub unlock_timestamp: i64,
    pub has_staked: bool,
    pub has_claimed: bool,
    pub bump: u8,
}

impl UserStake {
    pub const LEN: usize = 32 + 8 + 8 + 1 + 8 + 8 + 1 + 1 + 1;
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq)]
pub enum LockPeriod {
    SixMonths,
    NineMonths,
    TwelveMonths,
}

#[event]
pub struct StakeEvent {
    pub user: Pubkey,
    pub amount: u64,
    pub rewards_allocated: u64,
    pub lock_period: LockPeriod,
    pub unlock_timestamp: i64,
}

#[event]
pub struct ClaimEvent {
    pub user: Pubkey,
    pub principal_returned: u64,
    pub rewards_paid: u64,
    pub total_return: u64,
}

#[error_code]
pub enum ErrorCode {
    #[msg("Stake amount is below minimum")]
    AmountTooLow,
    #[msg("Stake amount exceeds maximum")]
    AmountTooHigh,
    #[msg("This wallet has already staked")]
    AlreadyStaked,
    #[msg("Insufficient rewards in pool")]
    InsufficientRewards,
    #[msg("No active stake found")]
    NoActiveStake,
    #[msg("Stake is still locked")]
    StillLocked,
    #[msg("Rewards already claimed")]
    AlreadyClaimed,
}
