

let config = {
    nodeUrl: process.env["ANCHOR_PROVIDER_URL"] || "https://api.mainnet-beta.solana.com/",
    users: {
        authority_addr:'3J6VD7p9S7t7QNSXBod9mbwWCZtzpwwkvrpcitWgB7tu',
        aythority_id:[
            // STUB
        ],

        operator_addr:'7W9auyNhW7iAffWDTvK5a1AbS978o3dkHFqZhvGysX9m',
        operator_id: [
            // STUB
        ],

        agent_addr:'FYRkDvPr3Ak9GqkF5CC8jnH7vVa5iAetyefwLiJrc8Zz',
        agent_id: [
            // STUB
        ],
    },
    idl:{
        demoApp:require('./idl/token_xport_demo.json'),
        gate_way: require('./idl/abi.SolMessageGateWay.json'),
    },
    SolanaChainId:2147484149,
    peer:{
        WanChainId:2153201998,
        WanAppScAddr:'0x2C502f4c7A98655D0d1A9A9aefa5c1b7e2750373',
        WanUserAddr:'0x93a7f07e94EAF48593905735EAC165fEE0306375',
    },
    scAddr:{
        USDC:'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
        gateway:"9J17hVJXCcMsD1E7Kv5yNKEgQAhwcu4NvtPQvXkgesiV",
        adminBoardAddr:'7jYCM8k5Nvwg5vyPpLk2yjivQhexPDMXuK8CSbUKqL6B',
    },

}

module.exports = config;