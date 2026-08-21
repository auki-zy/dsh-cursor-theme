// dsh-cursor-theme macOS system cursor overlay (experimental).
//
// Replaces the system cursor globally on macOS using the same approach as
// Mousecape: the private CoreGraphics API CGSSetGlobalCursorImage. Because
// macOS exposes NO public API for this, this helper is inherently private-
// API and may break with a future OS update — treat it as experimental.
//
// Requirements:
//   - Accessibility permission (AXIsProcessTrusted) for global mouse
//     monitoring + element introspection.
//   - A directory of per-state PNG cursors (default.png, pointer.png,
//     text.png, wait.png, not-allowed.png ...).
//
// Usage: mac-cursor-overlay --dir <cursorDir>
//
// On SIGTERM/SIGINT it resets the global cursor image to the system default
// before exiting (the host kills this process on stop/restore).

import AppKit
import ApplicationServices
import CoreGraphics

// Private CoreGraphics APIs (same ones Mousecape uses). Not in the public
// SDK headers; declared via @_silgen_name.
@_silgen_name("CGSSetGlobalCursorImage")
func CGSSetGlobalCursorImage(_ windowID: CGWindowID, _ image: CGImage?)

@_silgen_name("CGSResetGlobalCursor")
func CGSResetGlobalCursor(_ windowID: CGWindowID)

// --- argument parsing -------------------------------------------------------

let args = CommandLine.arguments
func argValue(_ name: String) -> String? {
  guard let idx = args.firstIndex(of: name), idx + 1 < args.count else { return nil }
  return args[idx + 1]
}
guard let dir = argValue("--dir") else {
  FileHandle.standardError.write("usage: mac-cursor-overlay --dir <cursorDir>\n".data(using: .utf8)!)
  exit(2)
}

// --- accessibility gate -----------------------------------------------------

guard AXIsProcessTrusted() else {
  FileHandle.standardError.write("AX_PERMISSION_DENIED\n".data(using: .utf8)!)
  exit(3)
}

// --- load cursors -----------------------------------------------------------

func loadCGImage(_ name: String) -> CGImage? {
  let path = (dir as NSString).appendingPathComponent("\(name).png")
  guard let img = NSImage(contentsOfFile: path) else { return nil }
  var rect = NSRect(origin: .zero, size: img.size)
  return img.cgImage(forProposedRect: &rect, context: nil, hints: nil)
}

func firstImage(_ names: [String]) -> CGImage? {
  for n in names { if let img = loadCGImage(n) { return img } }
  return nil
}

let fallback = firstImage(["default", "arrow", "pointer"]) ?? nil
let cursors: [String: CGImage?] = [
  "default": firstImage(["default", "arrow", "pointer"]),
  "pointer": firstImage(["pointer", "hand", "link", "default", "arrow"]),
  "text": firstImage(["text", "ibeam", "default", "arrow"]),
  "wait": firstImage(["wait", "progress", "default", "arrow"]),
  "not-allowed": firstImage(["not-allowed", "ban", "no", "default", "arrow"]),
  "grab": firstImage(["grab", "grabbing", "hand", "default", "arrow"]),
]
guard fallback != nil else {
  FileHandle.standardError.write("NO_CURSOR_IMAGES\n".data(using: .utf8)!)
  exit(4)
}

// --- state detection via Accessibility --------------------------------------

func stateAt(_ x: Float, _ y: Float) -> String {
  var element: AXUIElement?
  let result = AXUIElementCopyElementAtPosition(AXUIElementCreateSystemWide(), x, y, &element)
  guard result == .success, let el = element else { return "default" }
  var roleRef: CFTypeRef?
  if AXUIElementCopyAttributeValue(el, kAXRoleAttribute as CFString, &roleRef) == .success,
     let role = roleRef as? String {
    switch role {
    case kAXButtonRole, kAXLinkRole, kAXMenuItemRole, kAXPopUpButtonRole,
         kAXCheckBoxRole, kAXRadioButtonRole, kAXDisclosureTriangleRole:
      return "pointer"
    case kAXTextFieldRole, kAXTextAreaRole, kAXComboBoxRole, kAXSearchFieldRole:
      return "text"
    default:
      break
    }
  }
  var enabledRef: CFTypeRef?
  if AXUIElementCopyAttributeValue(el, kAXEnabledAttribute as CFString, &enabledRef) == .success,
     let enabled = enabledRef as? Bool, !enabled {
    return "not-allowed"
  }
  return "default"
}

// --- signal cleanup ----------------------------------------------------------

func resetCursor() {
  CGSResetGlobalCursor(0)
}

signal(SIGTERM) { _ in
  resetCursor()
  exit(0)
}
signal(SIGINT) { _ in
  resetCursor()
  exit(0)
}
signal(SIGHUP) { _ in
  resetCursor()
  exit(0)
}

// --- global mouse monitoring --------------------------------------------------

var current = ""
func applyCursor(at p: NSPoint) {
  let state = stateAt(Float(p.x), Float(p.y))
  guard state != current else { return }
  current = state
  if let img = cursors[state] ?? fallback {
    CGSSetGlobalCursorImage(0, img)
  }
}

// Initial apply.
applyCursor(at: NSEvent.mouseLocation)

NSEvent.addGlobalMonitorForEvents(
  matching: [.mouseMoved, .leftMouseDragged, .rightMouseDragged, .otherMouseDragged]
) { event in
  // NSEvent.mouseLocation is in screen coordinates (origin bottom-left),
  // matching AX positions.
  applyCursor(at: NSEvent.mouseLocation)
}

RunLoop.main.run()
