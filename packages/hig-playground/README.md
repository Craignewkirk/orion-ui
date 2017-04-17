## hig-integration-prototype

This project demonstrates a model for creating a strict separation between HIG.Web and Orion

## Structure

```
src/
  consumer              - Demonstrates different ways a React App can consume Orion
  orion/
    - hig-react.js      - React.js bindings for HIG.Web
    - higify.js         - Adapter for converting a single HIG.Web component to a React.js component
    - index.js          - Stateful Components based on hig-react
  hig.web               - Local fake version of HIG.Web
```

## consumer

At the highest level we have consumers which are React.js apps. They may be of varying levels of sophistication, some might want to use Orion components without having to manage state, some might want full control over the state of the components by way of an external state container such as Redux.

Consumers can use Orion at two different levels:

### Orion Components

these components are built by the Orion team and include state (which can optionally be overriden) transitions and idiomatic React APIs. These components have the smallest API surface area and are easy to integrate. The tradeoff is that they provide less control overall. See the Orion Menu in consumer/App.js for an example.

### Orion HIG-React Primitives

These components have a 1-1 mapping with HIG.Web components but they've been adapted to React and have idiomatic React APIs. Using HIG-React Primitives directly is fully supported if greater control over state management is desired. That said, HIG-React Primitives are not like typical React Components and have some unique characteristics:

1. Parent -> Child relationships are constrained

```jsx
<HIG.Menu>
  <HIG.Sidebar.Item>Hello World</HIG.Sidebar.Item>
</HIG.Menu>
```

This will generate an error: "Sidebar.Item must be inside a Sidebar.Group"

To properly render the `HIG.Sidebar.Item`:

```jsx
<HIG.Menu>
  <HIG.Sidebar open={true}>
    <HIG.Sidebar.Group>
      <HIG.Sidebar.Item>Hello World</HIG.Sidebar.Item>
    </HIG.Sidebar.Group>
  </HIG.Sidebar>
</HIG.Menu>
```

The HIG.Web team works with HIG Designers to ensure that components compose in a desirable way, that is then translated into constraints which prevent these components from being put together in arbitrary ways. This ensures that HIG components always look great.

2. Source Order may not work as expected

```jsx
<HIG.Menu>
  <HIG.Slot>
    <p>Hello Main App Content!</p>
  </HIG.Slot>
  <HIG.Menu.Top />
  <HIG.Sidebar open={true}>
    <HIG.Sidebar.Group>
      <HIG.Sidebar.Item>Hello World</HIG.Sidebar.Item>
    </HIG.Sidebar.Group>
  </HIG.Sidebar>
</HIG.Menu>
```

Regardless of the ordering of `HIG.Slot`, `HIG.Menu.Top`, and `HIG.Sidebar` the resulting rendering will always be the same:

```
+---------+---------------------+
|         |                     |
| sidebar | top                 |
|         |                     |
|         +---------------------+
|         |                     |
|         | slot                |
|         |                     |
|         |                     |
|         |                     |
+---------+---------------------+
```

This source-independant presentation is content specific. Some components (such as `HIG.Sidebar.Group`) render their children in order.

3. DOM elements can only be used where allowed

```jsx
<HIG.Menu>
  <div>Hello world</div>
</HIG.Menu>
```

This will generate an error: "HIG unapproved! HIG.Menu can not render DOM elements directly. Tried to render div."

To properly render the DOM content:

```jsx
<HIG.Menu>
  <HIG.Slot>
    <div>Hello world</div>
  </HIG.Slot>
</HIG.Menu>
```

HIG-React Primitives borrow the concept of "Slot" from the [Shadow DOM v1 API](https://developers.google.com/web/fundamentals/getting-started/primers/shadowdom#slots). Not every component accepts a `HIG.Slot`, check the documentation for details.

4. No styling

HIG-React Primitives are designed according to the HIG style guide and local styling is not supported. Talk to the HIG team for styling requirements.

## orion

### Components

#### Menu

A menu

Properties

name | type | default | required | description
---  | ---  | ---     | ---      | ---
`showTop` | `boolean` | true | false | Show or hide the top navigation. |
`groups` | `Group` | [ ] | false | A collection of Sidebar Groups.
`onItemClick` | `OnItemClickFn` | null | false | A function which is triggered when a Sidebar Group Item is clicked on.
`onToggle` | `OnToggleFn` | null | false | a function which is triggered when the Top Sidebar Toggle button is clicked on.
`open` | `boolean` | undefined | false | control the visibility of the sidebar. If specified the sidebar will **ALWAYS** obey the value of this property.
`selectedItem` | `GroupItem` | undefined | false | style the `GroupItem` passed uniquely (as a selection). If specified the sidebar will **ALWAYS** obey the value of this property.

Types

```typescript
type OnItemClickFn = (item: GroupItem, group: Group) => void;

type OnToggleFn = () => void;

interface Group {
  id: string;
  size?: 'small';
  items: GroupItem[];
}

interface GroupItem {
  id: string;
  label: string;
}
```

### HIG-React Primitives

#### Button

A basic button

Properties

name | type | default | required | description
---  | ---  | ---     | ---      | ---
`title` | `string` | '' | true | the label of the button
`link` | `string` | '#' | false | the href of the underlying anchor tag
`onClick` | `OnClickFn` | undefined | false | the function to call when the button is clicked

Types

```typescript
type OnClickFn = (event: MouseEvent) => void;
```

#### Menu

A container for the global menu components

Valid Children

* `Menu.Top`
* `Menu.Sidebar`
* `Slot`

Properties

**no properties**

Types

**no types**

#### Menu.Top

The header which nests inside the menu. Must be nested inside the Menu component.

Valid Children

* **no children**

Properties

name | type | default | required | description
---  | ---  | ---     | ---      | ---
`onToggle` | `OnToggleFn` | undefined | false | the function to call when the Sidebar toggle button is clicked

Types

```typescript
type OnToggleFn = () => void;
```

#### Menu.Sidebar

A container which sits at the side of the global menu. Must be nested inside the Menu component.

Valid Children

* `Menu.Sidebar.Group`

Properties

name | type | default | required | description
---  | ---  | ---     | ---      | ---
`open` | `boolean` | false | false | control the visibility of the sidebar

Types

**no types**

#### Menu.Sidebar.Group

A container which sits inside the Sidebar. Must be nested inside it.

Valid Children

* `Menu.Sidebar.Item`

Properties

name | type | default | required | description
---  | ---  | ---     | ---      | ---
`size` | `Size` | `large` | false | the visual size of the group

Types

```typescript
type Size = 'small' | 'large';
```

#### Menu.Sidebar.Item

An individual item inside a Sidebar.Group. Must be nested inside the Sidebar.Group.

Valid Children

* **no children**

Properties

name | type | default | required | description
---  | ---  | ---     | ---      | ---
`children` | `string` | "" | true | The label of the item
`selected` | `boolean` | false | false | Controls if the item looks selected
`onClick` | `OnClickFn` | undefined | false | the function to call when the Item is clicked

Types

```typescript
type OnClickFn = () => void;
```

## hig.web

Overall feedback for hig.web

Issues with Button:

* Button only takes a single dom element in constructor which it calls appendChild on. appendChild doesn't have the required control over DOM insertion. Need to support insertBefore to solve this problem. insertBefore acts exactly like appendChild if the referenceNode is not provided.

* There is no way to remove an event listener

I want to have an api like this for button in React:

<Button title="Hello World" link="http://google.com" onClick={this.handleClick} ...

This means I can either map title -> setTitle explictly in which case the interface.json is pretty much useless, or I can try to transform setTitle => title via string manipulation. Thoughts? Also why does interface.json need to be packaged at runtime?

* Instance creation issues

I'd like to be able to create any child and then only append it in valid locations.

e.g. Be able to create a MenuItem without having created a Menu yet and then only be able to do Menu.addItem(MenuItem)

* Query Selectors - why do we use querySelectors in the constructor functions? Recommend using domElement references for simplicity sake.

* Teardown - there is currently no way to tear down a component. Currently working around via this._hig.el.parentNode.removeChild(this._hig.el);

* Button is currently an inline element but has padding on it. Should be inline-block if you want padding

* Adding normalize.css to the page is a big no-no for components. Please remove it. All css added by HIG.Web must be namespaced and not global (this includes things like keyframe animations)