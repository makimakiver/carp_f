module nexus_wallet_management::nexus_wallet_management;

use std::string::String;
use sui::table::{Self, Table};
use ika_dwallet_2pc_mpc::coordinator_inner::DWalletCap;

// ── Errors ──────────────────────────────────────────────────────────
const ENotOwner: u64 = 0;
const EWalletNotFound: u64 = 1;

// ── Structs ─────────────────────────────────────────────────────────

/// A single dWallet entry in the registry.
public struct WalletEntry has store, drop, copy {
    /// The on-chain address of the dWallet object (derived from DWalletCap.dwallet_id)
    dwallet_addr: address,
    /// Human-readable label, e.g. "Main EVM"
    label: String,
    /// Target chain, e.g. "evm" or "solana"
    chain: String,
}

/// Updated WalletRegistry to use UserWallets
public struct WalletRegistry has key {
    id: UID,
    /// address → UserWallets
    wallets: Table<address, vector<WalletEntry>>,
}
// ── Init ────────────────────────────────────────────────────────────

fun init(ctx: &mut TxContext) {
    let registry = WalletRegistry {
        id: object::new(ctx),
        wallets: table::new(ctx),
    };
    transfer::share_object(registry);

}

// ── Public entry functions ──────────────────────────────────────────

/// Register a newly created dWallet.
/// Called right after the DKG completes and the caller holds a DWalletCap.
/// Extracts the dWallet address from the cap and stores it under the sender.
public fun register_dwallet(
    registry: &mut WalletRegistry,
    label: String,
    chain: String,
    dwallet_cap: &DWalletCap,
    ctx: &TxContext,
) {
    let sender = tx_context::sender(ctx);
    let entry = WalletEntry {
        dwallet_addr: dwallet_cap.dwallet_id().to_address(),
        label,
        chain,
    };

    if (table::contains(&registry.wallets, sender)) {
        let entries = table::borrow_mut(&mut registry.wallets, sender);
        vector::push_back(entries, entry);
    } else {
        let mut entries = vector::empty<WalletEntry>();
        vector::push_back(&mut entries, entry);
        table::add(&mut registry.wallets, sender, entries);
    };
}

// /// Remove a dWallet entry by its address.
// /// Only the owner (the address whose table row it lives in) can remove it.
// public fun remove_dwallet(
//     registry: &mut WalletRegistry,
//     dwallet_addr: address,
//     ctx: &TxContext,
// ) {
//     let sender = tx_context::sender(ctx);
//     assert!(table::contains(&registry.wallets, sender), ENotOwner);

//     let entries = table::borrow_mut(&mut registry.wallets, sender);
//     let len = vector::length(entries);
//     let mut i = 0;
//     let mut found = false;
//     while (i < len) {
//         if (vector::borrow(entries, i).dwallet_addr == dwallet_addr) {
//             vector::swap_remove(entries, i);
//             found = true;
//             break
//         };
//         i = i + 1;
//     };
//     assert!(found, EWalletNotFound);
// }

// // ── View helpers ────────────────────────────────────────────────────

// /// Number of dWallets registered by `owner`.
// public fun wallet_count(registry: &WalletRegistry, owner: address): u64 {
//     if (table::contains(&registry.wallets, owner)) {
//         vector::length(table::borrow(&registry.wallets, owner))
//     } else {
//         0
//     }
// }

/// Whether `owner` has any registered dWallets.
public fun has_wallets(registry: &WalletRegistry, owner: address): bool {
    table::contains(&registry.wallets, owner)
}

/// Borrow the full list of wallet entries for `owner`.
/// Aborts if the owner has no entries.
public fun get_wallets(registry: &WalletRegistry, owner: address): &vector<WalletEntry> {
    table::borrow(&registry.wallets, owner)
}

/// Read the dWallet address from an entry.
public fun entry_dwallet_addr(entry: &WalletEntry): address {
    entry.dwallet_addr
}

/// Read the label from an entry.
public fun entry_label(entry: &WalletEntry): &String {
    &entry.label
}

/// Read the chain from an entry.
public fun entry_chain(entry: &WalletEntry): &String {
    &entry.chain
}
