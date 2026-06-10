# UIKit Collections Patterns

## Diffable Data Source — UICollectionView

```swift
// 1. Define section and item types
enum Section: Hashable {
    case main
    case featured
}

struct Item: Hashable {
    let id: UUID
    let title: String
}

// 2. Cell registration (type-safe, no reuse identifier strings)
let cellRegistration = UICollectionView.CellRegistration<UICollectionViewCell, Item> { cell, indexPath, item in
    var content = cell.defaultContentConfiguration()
    content.text = item.title
    cell.contentConfiguration = content
}

// 3. Create diffable data source
let dataSource = UICollectionViewDiffableDataSource<Section, Item>(
    collectionView: collectionView
) { collectionView, indexPath, item in
    collectionView.dequeueConfiguredReusableCell(using: cellRegistration, for: indexPath, item: item)
}

// 4. Apply snapshot
var snapshot = NSDiffableDataSourceSnapshot<Section, Item>()
snapshot.appendSections([.main])
snapshot.appendItems(items, toSection: .main)
dataSource.apply(snapshot, animatingDifferences: true)
```

## Diffable Data Source — UITableView

```swift
let cellRegistration = UITableView.CellRegistration<UITableViewCell, Item> { cell, indexPath, item in
    var content = cell.defaultContentConfiguration()
    content.text = item.title
    content.secondaryText = item.subtitle
    cell.contentConfiguration = content
}

let dataSource = UITableViewDiffableDataSource<Section, Item>(
    tableView: tableView
) { tableView, indexPath, item in
    tableView.dequeueConfiguredReusableCell(using: cellRegistration, for: indexPath, item: item)
}
```

## Compositional Layout

```swift
// List layout (replaces UITableView for most cases)
let layout = UICollectionViewCompositionalLayout.list(
    using: .init(appearance: .insetGrouped)
)

// Custom grid layout
let layout = UICollectionViewCompositionalLayout { sectionIndex, environment in
    let itemSize = NSCollectionLayoutSize(
        widthDimension: .fractionalWidth(0.5),
        heightDimension: .estimated(200)
    )
    let item = NSCollectionLayoutItem(layoutSize: itemSize)

    let groupSize = NSCollectionLayoutSize(
        widthDimension: .fractionalWidth(1.0),
        heightDimension: .estimated(200)
    )
    let group = NSCollectionLayoutGroup.horizontal(
        layoutSize: groupSize,
        subitems: [item]
    )
    group.interItemSpacing = .fixed(16)

    let section = NSCollectionLayoutSection(group: group)
    section.interGroupSpacing = 16
    section.contentInsets = NSDirectionalEdgeInsets(top: 16, leading: 16, bottom: 16, trailing: 16)

    return section
}
```

### Size Dimensions

| Dimension | Use |
|-----------|-----|
| `.fractionalWidth(0.5)` | 50% of container width |
| `.fractionalHeight(1.0)` | 100% of container height |
| `.absolute(44)` | Fixed 44pt |
| `.estimated(200)` | Self-sizing, starting estimate 200pt |

## Supplementary Views (Headers/Footers)

```swift
// Registration
let headerRegistration = UICollectionView.SupplementaryRegistration<UICollectionViewCell>(
    elementKind: UICollectionView.elementKindSectionHeader
) { supplementaryView, elementKind, indexPath in
    var content = supplementaryView.defaultContentConfiguration()
    content.text = "Section Header"
    supplementaryView.contentConfiguration = content
}

// Provide via data source
dataSource.supplementaryViewProvider = { collectionView, kind, indexPath in
    collectionView.dequeueConfiguredReusableSupplementary(using: headerRegistration, for: indexPath)
}

// Add to layout section
let headerSize = NSCollectionLayoutSize(
    widthDimension: .fractionalWidth(1.0),
    heightDimension: .estimated(44)
)
let header = NSCollectionLayoutBoundarySupplementaryItem(
    layoutSize: headerSize,
    elementKind: UICollectionView.elementKindSectionHeader,
    alignment: .top
)
section.boundarySupplementaryItems = [header]
```

## Section Snapshots (Expandable Outlines)

```swift
struct OutlineItem: Hashable {
    let title: String
    let children: [OutlineItem]
}

// Build hierarchical snapshot
var sectionSnapshot = NSDiffableDataSourceSectionSnapshot<OutlineItem>()

for parent in rootItems {
    sectionSnapshot.append([parent])
    sectionSnapshot.append(parent.children, to: parent)
    sectionSnapshot.expand([parent]) // start expanded
}

dataSource.apply(sectionSnapshot, to: .main, animatingDifferences: true)
```

## Swipe Actions (UITableView / Collection List)

```swift
// Trailing swipe (delete, archive)
dataSource.trailingSwipeActionsConfigurationProvider = { indexPath in
    let deleteAction = UIContextualAction(style: .destructive, title: "Delete") { action, view, completion in
        // Handle delete
        completion(true)
    }
    return UISwipeActionsConfiguration(actions: [deleteAction])
}

// Leading swipe (pin, flag)
dataSource.leadingSwipeActionsConfigurationProvider = { indexPath in
    let pinAction = UIContextualAction(style: .normal, title: "Pin") { action, view, completion in
        completion(true)
    }
    pinAction.backgroundColor = .systemYellow
    return UISwipeActionsConfiguration(actions: [pinAction])
}
```

## Prefetching

```swift
collectionView.prefetchDataSource = self

extension MyViewController: UICollectionViewDataSourcePrefetching {
    func collectionView(_ collectionView: UICollectionView, prefetchItemsAt indexPaths: [IndexPath]) {
        // Start async data loading for upcoming cells
        for indexPath in indexPaths {
            let item = dataSource.itemIdentifier(for: indexPath)
            // Begin prefetch...
        }
    }

    func collectionView(_ collectionView: UICollectionView, cancelPrefetchingForItemsAt indexPaths: [IndexPath]) {
        // Cancel prefetch tasks
    }
}
```

## Common Mistakes

1. **Using legacy data source methods** — always use diffable data sources in new code.
2. **String-based cell reuse identifiers** — use `CellRegistration` instead.
3. **Applying snapshots off main thread** — `apply()` must be called on the main queue.
4. **Non-unique item identifiers** — diffable data sources require `Hashable` items with unique identity. Two items that are `==` will cause a crash.
5. **Using UICollectionViewFlowLayout** — use compositional layout in new code.
6. **Forgetting `estimatedItemSize`** — without it, self-sizing cells won't work.
