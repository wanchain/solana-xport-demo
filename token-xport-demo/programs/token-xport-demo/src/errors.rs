use anchor_lang::prelude::*;

#[error_code]
pub enum Errors {  //WARNING: Add new errors at the end, DON'T insert it. Otherwise you will corrupt the test-case!
    NotAnAdmin,
    NotAnOperator,
    HasInitialized,

    #[msg("Amount should > 0 .")]
    AmountShouldGreatThanZero,

    #[msg("Only specified program can call me.")]
    NotOwner,

    #[msg("Not match with the CPI signer")]
    NotMatchWithCpiSigner,

    #[msg("Not match with the messate type")]
    NotMatchMessageType
}

