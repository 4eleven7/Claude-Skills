# UIKit Interop Patterns

## UIViewRepresentable — UIKit View in SwiftUI

```swift
struct MapViewRepresentable: UIViewRepresentable {
    let region: MKCoordinateRegion
    @Binding var selectedAnnotation: MKAnnotation?

    func makeUIView(context: Context) -> MKMapView {
        let mapView = MKMapView()
        mapView.delegate = context.coordinator
        return mapView
    }

    func updateUIView(_ mapView: MKMapView, context: Context) {
        mapView.setRegion(region, animated: context.transaction.animation != nil)
    }

    func makeCoordinator() -> Coordinator {
        Coordinator(self)
    }

    class Coordinator: NSObject, MKMapViewDelegate {
        var parent: MapViewRepresentable

        init(_ parent: MapViewRepresentable) {
            self.parent = parent
        }

        func mapView(_ mapView: MKMapView, didSelect annotation: MKAnnotation) {
            parent.selectedAnnotation = annotation
        }
    }
}

// Usage in SwiftUI
struct ContentView: View {
    @State private var region = MKCoordinateRegion(/* ... */)
    @State private var selected: MKAnnotation?

    var body: some View {
        MapViewRepresentable(region: region, selectedAnnotation: $selected)
    }
}
```

### Key Rules

- `makeUIView` is called **once** — create and configure the view here
- `updateUIView` is called on **every SwiftUI state change** — sync state here, never recreate the view
- The `Coordinator` handles UIKit delegate callbacks and bridges them to SwiftUI via bindings
- Use `context.transaction.animation` to check if SwiftUI is animating

## UIViewControllerRepresentable — UIKit VC in SwiftUI

```swift
struct ImagePickerRepresentable: UIViewControllerRepresentable {
    @Binding var selectedImage: UIImage?
    @Environment(\.dismiss) private var dismiss

    func makeUIViewController(context: Context) -> UIImagePickerController {
        let picker = UIImagePickerController()
        picker.delegate = context.coordinator
        picker.sourceType = .photoLibrary
        return picker
    }

    func updateUIViewController(_ picker: UIImagePickerController, context: Context) {
        // Usually empty for pickers
    }

    func makeCoordinator() -> Coordinator {
        Coordinator(self)
    }

    class Coordinator: NSObject, UIImagePickerControllerDelegate, UINavigationControllerDelegate {
        let parent: ImagePickerRepresentable

        init(_ parent: ImagePickerRepresentable) {
            self.parent = parent
        }

        func imagePickerController(
            _ picker: UIImagePickerController,
            didFinishPickingMediaWithInfo info: [UIImagePickerController.InfoKey: Any]
        ) {
            parent.selectedImage = info[.originalImage] as? UIImage
            parent.dismiss()
        }

        func imagePickerControllerDidCancel(_ picker: UIImagePickerController) {
            parent.dismiss()
        }
    }
}
```

## Coordinated Animations (iOS 17+)

```swift
struct AnimatedWrapperView: UIViewRepresentable {
    var isExpanded: Bool

    func makeUIView(context: Context) -> UIView {
        let view = UIView()
        view.backgroundColor = .systemBlue
        view.layer.cornerRadius = 12
        return view
    }

    func updateUIView(_ uiView: UIView, context: Context) {
        // context.animate coordinates UIKit animation with SwiftUI
        context.animate {
            uiView.backgroundColor = isExpanded ? .systemGreen : .systemBlue
            uiView.transform = isExpanded
                ? CGAffineTransform(scaleX: 1.2, y: 1.2)
                : .identity
        }
    }
}

// SwiftUI side
struct ContentView: View {
    @State private var expanded = false

    var body: some View {
        AnimatedWrapperView(isExpanded: expanded)
            .frame(width: 100, height: 100)
            .onTapGesture {
                withAnimation(.spring) {
                    expanded.toggle()
                }
            }
    }
}
```

## UIHostingController — SwiftUI View in UIKit

```swift
class MyViewController: UIViewController {
    override func viewDidLoad() {
        super.viewDidLoad()

        let swiftUIView = MySwiftUIView(viewModel: viewModel)
        let hostingController = UIHostingController(rootView: swiftUIView)

        // Add as child view controller (IMPORTANT — don't just add the view)
        addChild(hostingController)
        view.addSubview(hostingController.view)
        hostingController.didMove(toParent: self)

        // Layout
        hostingController.view.translatesAutoresizingMaskIntoConstraints = false
        NSLayoutConstraint.activate([
            hostingController.view.topAnchor.constraint(equalTo: view.topAnchor),
            hostingController.view.leadingAnchor.constraint(equalTo: view.leadingAnchor),
            hostingController.view.trailingAnchor.constraint(equalTo: view.trailingAnchor),
            hostingController.view.bottomAnchor.constraint(equalTo: view.bottomAnchor),
        ])

        // Sizing options — let Auto Layout size the hosting controller
        hostingController.sizingOptions = .intrinsicContentSize
    }

    // Removing
    func removeSwiftUIChild(_ hostingController: UIHostingController<some View>) {
        hostingController.willMove(toParent: nil)
        hostingController.view.removeFromSuperview()
        hostingController.removeFromParent()
    }
}
```

### Updating the Root View

```swift
// When the SwiftUI view's data changes
hostingController.rootView = MySwiftUIView(viewModel: updatedViewModel)

// Or use @Observable / ObservableObject so SwiftUI updates reactively
```

## UIHostingConfiguration — SwiftUI Cells (iOS 16+)

```swift
let cellRegistration = UICollectionView.CellRegistration<UICollectionViewCell, Item> { cell, indexPath, item in
    cell.contentConfiguration = UIHostingConfiguration {
        HStack {
            Image(systemName: item.icon)
                .foregroundStyle(.secondary)
            VStack(alignment: .leading) {
                Text(item.title)
                    .font(.headline)
                Text(item.subtitle)
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
            }
            Spacer()
        }
    }
    .margins(.horizontal, 16) // content margins
}
```

### Advantages Over Hosting Controller Cells

- No need to manage child view controllers
- Automatic cell sizing
- Works with diffable data sources naturally
- Less memory overhead (no VC per cell)

## Incremental Adoption Patterns

### SwiftUI App Adopting UIKit

```swift
// Wrap UIKit views that SwiftUI can't express
struct UIKitTextView: UIViewRepresentable {
    @Binding var text: String
    // ... full UITextView with all delegate methods
}

// Wrap UIKit view controllers for complex flows
struct DocumentPickerView: UIViewControllerRepresentable {
    // ... UIDocumentPickerViewController
}
```

**Start with:** Leaf views (text editors, map views, camera previews) that have no SwiftUI equivalent or where the SwiftUI version is limited.

### UIKit App Adopting SwiftUI

```swift
// New screens as SwiftUI
let newFeatureVC = UIHostingController(rootView: NewFeatureView())
navigationController.pushViewController(newFeatureVC, animated: true)

// Replace cells with SwiftUI
cell.contentConfiguration = UIHostingConfiguration {
    NewCellDesign(item: item)
}

// Replace embedded views
let headerHost = UIHostingController(rootView: HeaderView())
addChild(headerHost)
headerView.addSubview(headerHost.view)
headerHost.didMove(toParent: self)
```

**Start with:** New features, redesigned screens, or individual cells/headers. Leave navigation and data flow in UIKit initially.

## Common Mistakes

1. **Recreating UIView in updateUIView** — `makeUIView` creates once, `updateUIView` syncs. Never call `MKMapView()` in update.
2. **Forgetting child VC lifecycle** — `addChild` → `addSubview` → `didMove(toParent:)`. Missing steps cause lifecycle bugs.
3. **Strong reference in Coordinator** — Coordinator holds `parent` (a struct copy), which is fine. But don't capture `self` of a class strongly.
4. **Not setting sizingOptions** — without `.intrinsicContentSize`, the hosting controller may not size correctly in Auto Layout.
5. **Using UIHostingController per collection cell** — use `UIHostingConfiguration` (iOS 16+) instead for cells.
6. **Ignoring context.animate** — without it, UIKit property changes jump while SwiftUI animates smoothly.
