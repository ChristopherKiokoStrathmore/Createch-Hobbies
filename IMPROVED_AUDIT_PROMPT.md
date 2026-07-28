# Professional Frontend Audit Prompt Template

Use this improved prompt to conduct comprehensive frontend audits for any web project.

---

## Improved Prompt (Rewritten for Better Results)

```
## Comprehensive Multi-Device Frontend Audit

Conduct a detailed, professional-grade frontend audit of [PROJECT_NAME] following this systematic framework:

### PHASE 1: VIEWPORT TESTING
Test the application across ALL of these viewports, documenting layout, functionality, and visual issues:

**Desktop & Laptop:**
- 1920×1080 (Full HD desktop)
- 1366×768 (Common laptop)
- 1280×720 (Standard laptop)

**Tablet:**
- 1024×768 (iPad landscape)
- 768×1024 (iPad portrait)
- 810×1080 (Samsung tablet landscape)

**Mobile:**
- 425×667 (iPhone baseline)
- 375×667 (iPhone small)
- 375×812 (iPhone Pro Max)
- 412×915 (Android common)

**Special Cases:**
- Mobile Landscape: 812×375
- Foldable simulations: 720×1600

### PHASE 2: CRITICAL AUDIT AREAS

#### A. Visual Hierarchy & Layout Integrity
- Is the hero section visible and properly formatted on ALL sizes?
- Do CTAs remain accessible (never hidden, cropped, or behind nav)?
- Does content stack logically without horizontal scrolling?
- Are images responsive and properly scaled?
- Do text lines break naturally (no orphans/widows)?

#### B. Typography & Readability
- Font sizes scale appropriately using `clamp()` or media queries
- Line heights maintained at 1.4-1.6 (test: is text readable?)
- Text hierarchy is clear and consistent across breakpoints
- No font size smaller than 12px on mobile
- Headings don't become too large on desktop (max 3.5rem for h1)
- Contrast ratios are WCAG AA compliant (4.5:1 minimum)

#### C. Navigation & Menu Systems
- Desktop menu displays correctly without wrapping
- Mobile menu is accessible and doesn't obstruct content
- Nav links remain visible (not hidden until needed)
- Dropdown menus work on touch devices
- Active nav state is clearly indicated
- No overlapping elements (nav vs. content)

#### D. Responsive Breakpoints
- Transitions between breakpoints are smooth (no jarring layout shifts)
- Content intelligently adapts (stacks, reflows, hides unnecessary elements)
- Breakpoints align with content needs, not just device sizes
- Media queries use mobile-first approach
- Tests at in-between sizes (not just 768/1024/1920)

#### E. Touch Interaction & Mobile UX
- Buttons and links are minimum 44×44px (iOS HIG standard)
- Button padding supports comfortable tapping
- No horizontal scrolling on any viewport
- Form inputs are large enough to tap accurately
- Tap targets have adequate spacing (min 8px)
- Hover states don't interfere with touch interactions
- No flash of unstyled content (FOUC)

#### F. Floating/Fixed Elements
- Fixed headers don't block content on mobile
- Fixed footers don't hide main content
- Floating buttons (WhatsApp, chat) don't overlap with:
  - Form inputs
  - Call-to-action buttons
  - Footer content
  - Text or images
- Z-index hierarchy is properly managed

#### G. Color & Contrast Accessibility
- Text passes WCAG AA standards (4.5:1 normal text, 3:1 large text)
- Button text remains readable against background
- No color-dependent information (use icons + text)
- Focus states are visible (outline or highlight)
- Sufficient contrast in charts/graphics

#### H. Performance & Loading
- No layout shift when images load (CLS issues)
- Lazy loading implemented for below-fold images
- Inline critical CSS where needed
- Font loading doesn't cause FOUT/FOIT
- No missing images or broken assets
- Videos don't autoplay or drain battery (mobile)

#### I. Forms & Input Fields
- Form labels are associated with inputs
- Placeholder text is visible (not used as label)
- Input fields have adequate height (44px minimum)
- Error messages are clear and associated with fields
- Success states are indicated
- Keyboard navigation works (tab order is logical)

#### J. Images & Media
- All images have descriptive alt text
- Images scale without pixelation or stretching
- SVGs render properly at all sizes
- Videos have captions/transcripts
- Image aspect ratios are maintained
- No decorative images take up space

### PHASE 3: DEVICE-SPECIFIC TESTING

#### iOS Considerations
- Safe area around notch/Dynamic Island is respected
- Bottom nav doesn't hide behind home indicator
- Touch targets account for thumb reach zones
- Font sizes don't trigger automatic zoom
- Viewport meta tag is correct

#### Android Considerations
- Displays work with system-level font scaling
- Tested on devices with notches and punch holes
- Hardware back button behavior is considered
- Navigation gestures don't conflict with app navigation

### PHASE 4: ACCESSIBILITY TESTING

#### Keyboard Navigation
- Tab order is logical
- Focus indicators are visible
- No keyboard traps
- Enter/Space activate buttons
- Arrow keys work in appropriate contexts (menus, sliders)

#### Screen Reader Testing (if possible)
- Headings are properly structured (h1 → h2 → h3)
- Links have descriptive text (not "click here")
- Form labels are announced with inputs
- Images have appropriate alt text or are hidden
- Landmark regions are defined (<main>, <nav>, <header>)

#### ARIA Implementation
- ARIA labels used where needed
- ARIA live regions for dynamic content
- ARIA hidden applied to decorative elements
- No redundant ARIA (input has label, doesn't need aria-label)

### PHASE 5: ISSUE CATEGORIZATION

Rate each issue by severity:

**CRITICAL:** 
- Blocks functionality on specific devices
- Accessibility violations (WCAG failure)
- Major layout breakage
- Content is unreachable or hidden

**HIGH:**
- Difficult to use on specific devices
- Poor readability issues
- Touch target too small (< 40px)
- Navigation confusing or broken

**MEDIUM:**
- Visual inconsistencies
- Minor readability issues
- Spacing problems
- Hover states missing

**LOW:**
- Minor visual tweaks
- Enhancement opportunities
- Polish and refinement
- Not impacting usability

### DELIVERABLES

Provide a comprehensive report including:

1. **Executive Summary**
   - Overall assessment (Good/Fair/Poor)
   - Critical issues count
   - Recommended priority

2. **Viewport-Specific Findings**
   - For each viewport, list issues specific to that size
   - Include screenshots of problems
   - Note if issue appears on multiple viewports

3. **Prioritized Issue List**
   - Title + severity level
   - Description of the problem
   - Impact on users
   - Affected viewports
   - Recommended fix

4. **Strengths**
   - What's working well
   - Good responsive patterns used
   - Positive accessibility features

5. **Recommendations**
   - Quick wins (easy fixes)
   - Medium-term improvements
   - Long-term optimization opportunities
   - Performance suggestions

6. **Testing Checklist**
   - Mark completed tests
   - Note any tools used
   - Device/browser versions tested

### TESTING TOOLS SUGGESTED

- Chrome DevTools (responsive mode)
- Firefox DevTools (responsive mode)
- Safari DevTools (on macOS)
- Lighthouse (Chrome DevTools → Lighthouse)
- axe DevTools (accessibility)
- WAVE Browser Extension (accessibility)
- WebAIM Contrast Checker (color contrast)
- Real devices (if available)

---

## Key Metrics to Evaluate

- **Responsive Design Score:** 0-100 (how well it adapts across devices)
- **Accessibility Score:** 0-100 (Lighthouse estimated)
- **Touch-Friendliness:** 0-100 (button sizes, spacing, responsiveness)
- **Performance:** LCP, FCP, CLS (Core Web Vitals)
- **Browser Compatibility:** # of browsers/devices tested

---

## Expected Audit Duration

- Quick Audit (1-2 hours): Essential viewports, major issues only
- Standard Audit (3-4 hours): All viewports, detailed findings
- Comprehensive Audit (6-8 hours): Includes testing, screenshots, detailed recommendations

---

## Common Responsive Design Issues to Look For

1. Nav menu breaks at medium sizes
2. Hero image doesn't scale responsively
3. Grid layouts don't reflow on tablet
4. Text is too large/small on mobile
5. Form inputs are too small to tap
6. Fixed headers cover content
7. Footer is unreachable on mobile
8. Buttons have inadequate spacing
9. Images are stretched/distorted
10. Buttons wrap unexpectedly at certain widths
```

---

## Why This Prompt is Better

### Improvements Over Original:

1. **Specific Breakpoint Testing**
   - Original: "Check portrait and landscape view"
   - Improved: Lists 10+ specific viewport sizes with exact dimensions

2. **Systematic Framework**
   - Original: Generic list
   - Improved: 10 detailed audit phases with specific criteria

3. **Actionable Criteria**
   - Original: "Check compatibility"
   - Improved: "Tab order is logical, focus indicators visible, no keyboard traps"

4. **Measurable Results**
   - Original: Identify weaknesses
   - Improved: Rate by severity (CRITICAL/HIGH/MEDIUM/LOW) with impact assessment

5. **Professional Deliverables**
   - Original: Vague findings expected
   - Improved: Specific report structure with all sections required

6. **Test Tools Specified**
   - Original: No testing tools mentioned
   - Improved: Lists specific DevTools, extensions, and online tools

7. **Priority for Implementation**
   - Original: Just list issues
   - Improved: "Quick wins," medium-term, and long-term recommendations

8. **Context for Decision-Makers**
   - Original: Technical only
   - Improved: Includes user impact and business priority

---

## How to Use This Template

1. **Customize for your project:**
   ```
   Conduct a detailed, professional-grade frontend audit of [MY_ECOMMERCE_SITE]...
   ```

2. **Adjust viewport list for your audience:**
   - Add specific devices your analytics shows
   - Remove less relevant sizes

3. **Add project-specific focus areas:**
   - E-commerce? Add checkout flow testing
   - SaaS? Add data table responsiveness
   - Blog? Add article layout testing

4. **Specify your acceptance criteria:**
   - "Must pass Lighthouse 90+ on mobile"
   - "All buttons must be 48×48px minimum"
   - "WCAG AAA compliance required"

---

## Results: Before vs. After Using This Prompt

**Before (Original Vague Prompt):**
- Auditor: "I found weaknesses in the mobile view"
- Result: 3-4 generic issues, unclear priorities, no actionable fixes

**After (Improved Detailed Prompt):**
- Auditor: "CRITICAL: Hero logo hidden on 768px tablet portrait. FIX: Add background color fallback. Impact: Users don't see branding. Timeline: 30 mins."
- Result: 15+ specific issues, ranked by severity, with impacts and solutions

---

## Final Notes

This improved prompt template ensures:
✅ Comprehensive coverage of all viewport sizes  
✅ Systematic evaluation of all design aspects  
✅ Clear prioritization and actionable recommendations  
✅ Professional-grade deliverables  
✅ Measurable accessibility and performance criteria  
✅ Easy to adapt for any web project  

Use this for future audits to get consistently high-quality results!
