---
name: uikit-collections
description: Use when building or reviewing UITableView, UICollectionView, diffable data sources, compositional layout, or cell registration.
---

# UIKit Collections

Review and write UITableView and UICollectionView code for correct data source management, modern cell registration, and compositional layouts.

## Responsibility

**Owns:** UITableView, UICollectionView, UITableViewDiffableDataSource, UICollectionViewDiffableDataSource, NSDiffableDataSourceSnapshot, NSDiffableDataSourceSectionSnapshot, UICollectionViewCompositionalLayout, NSCollectionLayoutSection/Group/Item, UICollectionView.CellRegistration, UITableView.CellRegistration, supplementary views, self-sizing cells, swipe actions, prefetching.

**Does NOT own:** SwiftUI List/LazyVGrid (swiftui-patterns skill), Core Data fetch results controllers (core-data skill), view controller lifecycle (uikit-fundamentals skill).

## Core Principles

1. **Diffable data sources are the default.** Never use the legacy `numberOfRows` / `cellForRow` pattern in new code. Diffable data sources eliminate index-out-of-range crashes.
2. **Cell registration over `register(_:forCellReuseIdentifier:)`.** Use `UICollectionView.CellRegistration` / `UITableView.CellRegistration` for type-safe cell configuration.
3. **Compositional layout for collections.** Use `NSCollectionLayoutSection` with `NSCollectionLayoutGroup` and `NSCollectionLayoutItem` — never `UICollectionViewFlowLayout` in new code.
4. **Section snapshots for hierarchy.** Use `NSDiffableDataSourceSectionSnapshot` for expandable/collapsible outlines.
5. **Apply snapshots on the main queue.** Always call `apply(_:animatingDifferences:)` from the main thread.
6. **Self-sizing cells.** Set `estimatedItemSize` to `.automatic` or provide estimated dimensions. Ensure cells have unambiguous height constraints.

## References

- `references/uikit-collections-patterns.md` — Diffable data sources, compositional layout, cell registration
