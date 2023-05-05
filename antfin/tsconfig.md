常⽤的tsconfig.json配置
```
{
  "compilerOptions": {
    "outDir": "dist",
    "module": "esnext",
    "target": "es5",
    "lib": ["esnext", "dom"],
    "baseUrl": "./",
    "jsx": "react",
    "resolveJsonModule": true,
    "allowSyntheticDefaultImports": true,
    "moduleResolution": "node",
    "forceConsistentCasingInFileNames": true,
    "noImplicitReturns": true,
    "suppressImplicitAnyIndexErrors": true,
    "noUnusedLocals": true,
    "experimentalDecorators": true,
    "strict": true,
    "skipLibCheck": true,
    "declaration": true
  },
  "exclude": [
    "node_modules",
    "build",
    "dist"
  ],
  "include": ["src/*.ts"]
}
```
