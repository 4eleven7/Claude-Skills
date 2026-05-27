# UIKit Navigation Patterns

## UINavigationController — Push/Pop

```swift
// Push (drill-down)
let detailVC = DetailViewController(item: selectedItem)
navigationController?.pushViewController(detailVC, animated: true)

// Pop
navigationController?.popViewController(animated: true)
navigationController?.popToRootViewController(animated: true)
navigationController?.popToViewController(targetVC, animated: true)
```

### Navigation Bar Configuration

```swift
class MyViewController: UIViewController {
    override func viewDidLoad() {
        super.viewDidLoad()

        title = "My Screen"
        navigationItem.largeTitleDisplayMode = .always  // .always, .never, .automatic

        // Bar buttons
        navigationItem.rightBarButtonItem = UIBarButtonItem(
            systemItem: .add,
            primaryAction: UIAction { [weak self] _ in
                self?.addItem()
            }
        )

        // Multiple buttons
        navigationItem.rightBarButtonItems = [editButton, addButton]

        // Search
        navigationItem.searchController = UISearchController(searchResultsController: nil)
        navigationItem.hidesSearchBarWhenScrolling = true
    }
}

// Navigation bar appearance (iOS 15+)
let appearance = UINavigationBarAppearance()
appearance.configureWithOpaqueBackground()
appearance.backgroundColor = .systemBackground
appearance.titleTextAttributes = [.foregroundColor: UIColor.label]
appearance.largeTitleTextAttributes = [.foregroundColor: UIColor.label]

navigationBar.standardAppearance = appearance
navigationBar.scrollEdgeAppearance = appearance    // when scrolled to top
navigationBar.compactAppearance = appearance        // landscape on iPhone
```

## Modal Presentation

```swift
let settingsVC = SettingsViewController()
let nav = UINavigationController(rootViewController: settingsVC)

// Presentation style
nav.modalPresentationStyle = .pageSheet      // default on iOS 15+
// .fullScreen    — covers everything, no swipe dismiss
// .formSheet     — compact dialog on iPad
// .automatic     — system chooses (usually .pageSheet)
// .overFullScreen — like fullScreen but doesn't remove presenting VC's view

// Sheet customization (iOS 15+)
if let sheet = nav.sheetPresentationController {
    sheet.detents = [.medium(), .large()]
    sheet.prefersGrabberVisible = true
    sheet.prefersScrollingExpandsWhenScrolledToEdge = false
    sheet.selectedDetentIdentifier = .medium
    sheet.largestUndimmedDetentIdentifier = .medium  // no dimming at medium
}

present(nav, animated: true)
```

### Handling Dismissal

```swift
// For .pageSheet / .formSheet — user can swipe to dismiss
class MyViewController: UIViewController, UIAdaptivePresentationControllerDelegate {
    func presentSettings() {
        let nav = UINavigationController(rootViewController: settingsVC)
        nav.presentationController?.delegate = self
        present(nav, animated: true)
    }

    // Called when user swipes to dismiss
    func presentationControllerDidDismiss(_ presentationController: UIPresentationController) {
        // Clean up, save state
    }

    // Prevent dismissal (e.g., unsaved changes)
    func presentationControllerShouldDismiss(_ presentationController: UIPresentationController) -> Bool {
        return !hasUnsavedChanges
    }

    // Called when dismissal prevented — show confirmation
    func presentationControllerDidAttemptToDismiss(_ presentationController: UIPresentationController) {
        showDiscardChangesAlert()
    }
}
```

## Custom Transitions

```swift
// 1. Transitioning delegate
class MyTransitioningDelegate: NSObject, UIViewControllerTransitioningDelegate {
    func animationController(
        forPresented presented: UIViewController,
        presenting: UIViewController,
        source: UIViewController
    ) -> UIViewControllerAnimatedTransitioning? {
        return FadeInAnimator()
    }

    func animationController(
        forDismissed dismissed: UIViewController
    ) -> UIViewControllerAnimatedTransitioning? {
        return FadeOutAnimator()
    }

    // Optional: custom presentation controller
    func presentationController(
        forPresented presented: UIViewController,
        presenting: UIViewController?,
        source: UIViewController
    ) -> UIPresentationController? {
        return DimmingPresentationController(
            presentedViewController: presented,
            presenting: presenting
        )
    }
}

// 2. Animated transitioning
class FadeInAnimator: NSObject, UIViewControllerAnimatedTransitioning {
    func transitionDuration(using context: UIViewControllerContextTransitioning?) -> TimeInterval {
        return 0.3
    }

    func animateTransition(using context: UIViewControllerContextTransitioning) {
        guard let toView = context.view(forKey: .to) else { return }

        let container = context.containerView
        toView.alpha = 0
        container.addSubview(toView)
        toView.frame = context.finalFrame(for: context.viewController(forKey: .to)!)

        UIView.animate(
            withDuration: transitionDuration(using: context),
            animations: { toView.alpha = 1 },
            completion: { _ in context.completeTransition(!context.transitionWasCancelled) }
        )
    }
}

// 3. Use it
let vc = MyViewController()
vc.modalPresentationStyle = .custom
vc.transitioningDelegate = transitioningDelegate
present(vc, animated: true)
```

## Custom Presentation Controller

```swift
class DimmingPresentationController: UIPresentationController {
    private let dimmingView = UIView()

    override var frameOfPresentedViewInContainerView: CGRect {
        guard let container = containerView else { return .zero }
        // Center with padding
        let size = CGSize(width: container.bounds.width - 64, height: container.bounds.height * 0.6)
        let origin = CGPoint(
            x: (container.bounds.width - size.width) / 2,
            y: (container.bounds.height - size.height) / 2
        )
        return CGRect(origin: origin, size: size)
    }

    override func presentationTransitionWillBegin() {
        guard let container = containerView else { return }
        dimmingView.backgroundColor = UIColor.black.withAlphaComponent(0.4)
        dimmingView.frame = container.bounds
        dimmingView.alpha = 0
        container.insertSubview(dimmingView, at: 0)

        presentedViewController.transitionCoordinator?.animate { _ in
            self.dimmingView.alpha = 1
        }
    }

    override func dismissalTransitionWillBegin() {
        presentedViewController.transitionCoordinator?.animate { _ in
            self.dimmingView.alpha = 0
        }
    }
}
```

## Coordinator Pattern

```swift
protocol Coordinator: AnyObject {
    var childCoordinators: [Coordinator] { get set }
    var navigationController: UINavigationController { get }
    func start()
}

class AppCoordinator: Coordinator {
    var childCoordinators: [Coordinator] = []
    var navigationController: UINavigationController

    init(navigationController: UINavigationController) {
        self.navigationController = navigationController
    }

    func start() {
        let homeVC = HomeViewController()
        homeVC.delegate = self
        navigationController.pushViewController(homeVC, animated: false)
    }

    private func showDetail(for item: Item) {
        let detailCoordinator = DetailCoordinator(
            navigationController: navigationController,
            item: item
        )
        detailCoordinator.parentCoordinator = self
        childCoordinators.append(detailCoordinator)
        detailCoordinator.start()
    }

    func childDidFinish(_ child: Coordinator) {
        childCoordinators.removeAll { $0 === child }
    }
}

extension AppCoordinator: HomeViewControllerDelegate {
    func homeViewController(_ vc: HomeViewController, didSelect item: Item) {
        showDetail(for: item)
    }
}

// View controller only talks to its delegate — no navigation knowledge
protocol HomeViewControllerDelegate: AnyObject {
    func homeViewController(_ vc: HomeViewController, didSelect item: Item)
}

class HomeViewController: UIViewController {
    weak var delegate: HomeViewControllerDelegate?

    func didTapItem(_ item: Item) {
        delegate?.homeViewController(self, didSelect: item)
    }
}
```

## Common Mistakes

1. **Pushing onto a nav controller from a presented VC** — presented VCs need their own nav controller. Use `UINavigationController(rootViewController:)`.
2. **Not handling swipe-to-dismiss** — `.pageSheet` can be dismissed by the user. Always implement `presentationControllerDidDismiss` when state cleanup is needed.
3. **Forgetting `completeTransition`** — custom transitions must call `context.completeTransition()` or the UI freezes.
4. **Strong reference to coordinator** — view controllers should hold `weak` delegate references to avoid retain cycles.
5. **Setting `modalPresentationStyle` after `present`** — set it before calling `present(_:animated:)`.
