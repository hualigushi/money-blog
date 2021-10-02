```jsx
 class ErrorBoundary extends React.Component<
  React.PropsWithChildren<{ fallbackRender: FallbackRender }>,
  { error: Error | null }
> {}
```

等价于

```jsx
 class ErrorBoundary extends React.Component
  { children:React.ReactNode, fallbackRender: FallbackRender },
  { error: Error | null }
> {}
```

