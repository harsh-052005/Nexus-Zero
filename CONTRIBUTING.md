# Contributing to Nexus-Zero

Thank you for your interest in contributing to **Nexus-Zero**! We welcome bug reports, feature suggestions, documentation enhancements, and code contributions.

---

## Developer Certificate of Origin (DCO)

All contributions to this repository must certify adherence to the [Developer Certificate of Origin 1.1](./DCO.md).

To sign off on your commit, use the `-s` or `--signoff` flag:

```bash
git commit -s -m "feat(flight): add inverted flight thruster stabilization"
```

This adds a sign-off footer to your commit message:
```text
Signed-off-by: Random J Developer <random@developer.example.org>
```

---

## Development Workflow

1. **Fork & Clone** the repository:
   ```bash
   git clone https://github.com/harsh-052005/Nexus-Zero.git
   cd Nexus-Zero
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Start Development Server**:
   ```bash
   npm run dev
   ```

4. **Code Quality & Validation**:
   - Ensure clean TypeScript compilation and bundling:
     ```bash
     npm run build
     ```
   - Check linting rules:
     ```bash
     npm run lint
     ```

5. **Submitting Changes**:
   - Create a feature branch (`git checkout -b feature/my-feature`).
   - Commit with descriptive messages and sign-off (`-s`).
   - Push to your fork and submit a Pull Request.

---

## Code Style

- Write clean, type-safe TypeScript.
- Follow component encapsulation in React 19.
- Use shader and WebGL optimizations for smooth 60fps rendering in Three.js and `@react-three/fiber`.
