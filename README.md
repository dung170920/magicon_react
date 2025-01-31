# Magicon

## Table of Contents

- [Website](#website)
- [Installation](#installation)
- [Usage Examples](#usage-examples)

## Website

Visit [website](https://magicon.vercel.app/) to view icons

## Installation

```bash
# install dependencies
$ npm i magicon
```

Or via yarn:

```bash
yarn add magicon
```

## Usage Examples

```jsx
import React from "react";
//import icon.
import { AlarmClock } from "magicon";

const Example = () => {
  // then use it as a normal React Component
  return <AlarmClock />;
};
```

### Control Icon Props

Adjust the props of your icons by passing a inline prop:

```jsx
import { AlarmClock } from "magicon";

<AlarmClock variant="filled" size={32} color="#eee" />;
```

### Props

| Prop      | Type               | Default        | Note                   |
| --------- | ------------------ | -------------- | ---------------------- |
| `color`   | `string`           | `currentColor` | color                  |
| `size`    | `number` `string`  | 24px           | size={24} or size="24" |
| `variant` | `outline` `filled` | `outline`      | icons styles           |
| `class`   | `string`           |                | icons class            |

---
