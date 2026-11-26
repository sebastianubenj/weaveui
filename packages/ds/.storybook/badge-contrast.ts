// Badge contrast is a project-specific rule, not WCAG AA conformance.
export const badgeContrastConfig = {
  checks: [{
    id: "badge-contrast",
    evaluate: "color-contrast-evaluate",
    options: {
      ignoreUnicode: true, ignoreLength: false, ignorePseudo: false,
      boldValue: 700, boldTextPt: 14, largeTextPt: 18,
      contrastRatio: { normal: { expected: 3.5 }, large: { expected: 3.5 } },
      pseudoSizeThreshold: 0.25, shadowOutlineEmMax: 0.2, textStrokeEmMin: 0.03,
    },
    metadata: {
      impact: "serious" as const,
      messages: {
        pass: "Badge text has sufficient contrast",
        fail: "Badge text must have a contrast ratio of at least 3.5:1",
        incomplete: "Badge contrast could not be determined",
      },
    },
  }],
  rules: [
    { id: "color-contrast", selector: ":not([data-badge]):not([data-badge] *)" },
    {
      id: "badge-contrast", selector: "[data-badge], [data-badge] *",
      matches: "color-contrast-matches", excludeHidden: false,
      any: ["badge-contrast"], tags: ["cat.color"], impact: "serious" as const,
      metadata: {
        description: "Badge text must have at least 3.5:1 contrast",
        help: "Badge text must have at least 3.5:1 contrast",
        helpUrl: "https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html",
      },
    },
  ],
};
