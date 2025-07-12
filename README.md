# lab_react-custom-hooks

![logo_ironhack_blue 7](https://user-images.githubusercontent.com/23629340/40541063-a07a0a8a-601a-11e8-91b5-2f13e4e6b441.png)

# LAB | React Custom Hooks

## Learning Goals

After this exercise, you will be able to:

- Identify and extract repetitive stateful logic from React components.
- Create a generic, reusable custom hook from scratch.
- Refactor multiple components to use a custom hook, making the codebase cleaner and more maintainable.
- Understand how to handle loading and error states within a custom hook.
- Implement cleanup logic in `useEffect` to prevent memory leaks.

<br>

## Requirements

- You will be creating a new React project from scratch for this lab.
- No repository is provided. You will be creating your own.

<br>

## Submission

- Upon completion, create a new repository on GitHub.
- Add your local project to the remote repository.
- Run the following commands:

```shell
$ git add .
$ git commit -m "Solved lab"
$ git push origin main
```

- Share the repository link with your TAs.

<br>

## Test Your Code

For this lab, you will test your code by running the application and observing its behavior in the browser. There are no pre-written unit tests.

To run your React application, run the following command from the root of the project:

```shell
$ npm run dev
```

To see the outputs of `console.log` in your JavaScript code, open the [Console in the Developer Tools](https://developer.chrome.com/docs/devtools/open/#console) of your browser.

<br>

## Instructions

The goal of this exercise is to build a small React application that has duplicated data-fetching logic, and then refactor it using a custom hook. You will create a single `useFetch` hook to handle all data fetching, thereby cleaning up the components and making the logic reusable.

This exercise is split into multiple iterations:

- **Setup**: You will create a new React project from scratch and build two components that contain duplicated logic.
- **Logic**: You will develop the logic for the `useFetch` custom hook.
- **Refactoring**: You will use your new hook to refactor the two components, removing the duplicated code.

<br>

### Iteration 0 - Setup and The Problem

First, let's create our React project and see the problem we're trying to solve.

1.  **Create a React Project**: Open your terminal, navigate to the directory where you want to store your project, and run the following command to create a new React project with JavaScript using Vite.

    ```shell
    $ npm create vite@latest lab-react-custom-hooks -- --template react
    ```

    When prompted, navigate into the new directory: `cd lab-react-custom-hooks`.

2.  **Install Dependencies**: We'll need `axios` for making API calls. Install it now:

    ```shell
    $ npm install axios
    ```

3.  **Clean Up**: Open the project in VS Code. Delete the contents of `App.css` and `index.css`. Also, delete the `assets` folder. We want to start fresh.

4.  **Create Components**: Inside the `src` folder, create a new folder called `components`. Inside `src/components`, create two files: `PublicGists.jsx` and `UserGists.jsx`.

5.  **Build `PublicGists.jsx`**: This component will fetch and display a list of public GitHub Gists. Copy the following code into `src/components/PublicGists.jsx`:

    ```jsx
    // src/components/PublicGists.jsx
    import { useState, useEffect } from 'react';
    import axios from 'axios';

    const PublicGists = () => {
      const [gists, setGists] = useState([]);
      const [loading, setLoading] = useState(true);
      const [error, setError] = useState(null);

      useEffect(() => {
        const fetchGists = async () => {
          try {
            const response = await axios.get('https://api.github.com/gists/public');
            setGists(response.data);
          } catch (err) {
            setError(err);
          } finally {
            setLoading(false);
          }
        };

        fetchGists();
      }, []); // Empty dependency array means this runs once on mount

      if (loading) return <p>Loading public gists...</p>;
      if (error) return <p>Error fetching gists: {error.message}</p>;

      return (
        <div>
          <h2>Public Gists</h2>
          <ul>
            {gists.map(gist => (
              <li key={gist.id}>
                <a href={gist.html_url} target="_blank" rel="noopener noreferrer">
                  {gist.description || 'No description'}
                </a>
              </li>
            ))}
          </ul>
        </div>
      );
    };

    export default PublicGists;
    ```

6.  **Build `UserGists.jsx`**: This component does almost the same thing, but fetches Gists for a specific user. Notice how similar the logic is. This is the code duplication we want to fix. Copy this code into `src/components/UserGists.jsx`:

    ```jsx
    // src/components/UserGists.jsx
    import { useState, useEffect } from 'react';
    import axios from 'axios';

    const UserGists = () => {
      const [gists, setGists] = useState([]);
      const [loading, setLoading] = useState(true);
      const [error, setError] = useState(null);
      const username = 'gaearon'; // A famous React developer!

      useEffect(() => {
        const fetchGists = async () => {
          try {
            const response = await axios.get(`https://api.github.com/users/${username}/gists`);
            setGists(response.data);
          } catch (err) {
            setError(err);
          } finally {
            setLoading(false);
          }
        };

        fetchGists();
      }, []); // The username is hardcoded, so we still run once

      if (loading) return <p>Loading {username}'s gists...</p>;
      if (error) return <p>Error fetching gists: {error.message}</p>;

      return (
        <div>
          <h2>{username}'s Gists</h2>
          <ul>
            {gists.map(gist => (
              <li key={gist.id}>
                <a href={gist.html_url} target="_blank" rel="noopener noreferrer">
                  {gist.description || 'No description'}
                </a>
              </li>
            ))}
          </ul>
        </div>
      );
    };

    export default UserGists;
    ```

7.  **Update `App.jsx`**: Finally, let's render these two components in our main `App` component. Replace the content of `src/App.jsx` with this:

    ```jsx
    // src/App.jsx
    import PublicGists from './components/PublicGists';
    import UserGists from './components/UserGists';

    function App() {
      return (
        <div>
          <h1>React Custom Hooks Lab</h1>
          <PublicGists />
          <hr />
          <UserGists />
        </div>
      );
    }

    export default App;
    ```

8.  **Run the App**: Go to your terminal and run `npm run dev`. Open your browser to the specified URL. You should see both lists of Gists load. Take a moment to appreciate the duplicated logic in both component files. Our mission is to eliminate it!

<br>

### Iteration 1 - Create the `useFetch` Custom Hook

Now for the fun part! Let's extract the duplicated logic into a reusable custom hook.

> [!TIP]
> A custom hook is just a JavaScript function whose name starts with `use` and that can call other hooks. It's a fundamental pattern for building scalable React apps and following the **DRY (Don't Repeat Yourself)** principle.

#### `useFetch` Hook Requirements

1.  **Create the file**: Inside the `src` folder, create a new folder named `hooks`. Inside `src/hooks`, create a new file named `useFetch.js`.
2.  **Define the function**: Export a function named `useFetch`. It should accept one argument: `url` (a string).
3.  **Manage State**: Inside the hook, declare three state variables using `useState`:
    - `data`: To store the fetched data. Initialize it as `null`.
    - `loading`: To track the loading state. Initialize it as `true`.
    - `error`: To store any potential error. Initialize it as `null`.
4.  **Fetch Data**: Use the `useEffect` hook to perform the data fetching.
    - The effect should run whenever the `url` prop changes.
    - Inside the effect, define an `async` function to fetch data from the provided `url` using `axios`.
    - Handle the success case: set the fetched data into the `data` state and set `error` to `null`.
    - Handle the error case: catch any errors, store them in the `error` state, and set `data` to `null`.
    - Use a `finally` block to set `loading` to `false` after the fetch attempt is complete (whether it succeeded or failed).
5.  **Return Values**: The hook should return an object containing the three state variables: `{ data, loading, error }`.

<details>
  <summary>Click for Solution</summary>

```jsx
// src/hooks/useFetch.js
import { useState, useEffect } from 'react';
import axios from 'axios';

export function useFetch(url) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(url);
        setData(response.data);
        setError(null);
      } catch (err) {
        setError(err);
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [url]); // Re-run the effect if the URL changes

  return { data, loading, error };
}
```

</details>

<br>

### Iteration 2 - Refactor the `PublicGists` Component

With our `useFetch` hook ready, let's put it to work. For this iteration, you'll be working in **`src/components/PublicGists.jsx`**.

Your goal is to remove all the manual `useState` and `useEffect` logic for data fetching and replace it with a single call to your new `useFetch` hook.

1.  **Import the hook**: At the top of the file, import your `useFetch` hook: `import { useFetch } from '../hooks/useFetch';`.
2.  **Call the hook**: Inside the `PublicGists` component, call your hook with the public gists API URL.

    ```jsx
    const { data: gists, loading, error } = useFetch('https://api.github.com/gists/public');
    ```

    > [!NOTE]
    > We are renaming `data` to `gists` using destructuring assignment (`data: gists`). This makes the component's code more readable.

3.  **Remove old code**: Delete the `useState` calls for `gists`, `loading`, and `error`, and also delete the entire `useEffect` block that was performing the fetch. You can also remove the `useState` and `useEffect` imports from React.

Your component should now be much shorter and cleaner. It is now only responsible for _displaying_ the UI based on the state provided by the hook, not managing the fetching logic itself. This is called **Separation of Concerns**.

Check your application in the browser. It should still work exactly as before.

<br>

### Iteration 3 - Refactor the `UserGists` Component

To see the true power of reusability, let's refactor the second component. You'll be working in **`src/components/UserGists.jsx`**.

1.  **Import the hook**: `import { useFetch } from '../hooks/useFetch';`.
2.  **Call the hook**: Just like before, replace the `useState` and `useEffect` blocks with a single call to `useFetch`. This time, use the user-specific API endpoint.

    ```jsx
    const username = 'gaearon'; // A famous React developer!
    const { data: gists, loading, error } = useFetch(`https://api.github.com/users/${username}/gists`);
    ```

3.  **Remove old code**: Delete the now-redundant `useState` and `useEffect` logic and their imports.

You have now refactored two components using the same hook, removing a significant amount of duplicated code. If you ever need to change how data is fetched (e.g., add authentication headers), you only need to change it in one place: `useFetch.js`.

<br>

### Iteration 4 (Bonus) - Add Request Cancellation

What happens if a component unmounts while a fetch request is still in progress? React will show a warning in the console about trying to update the state of an unmounted component. This can lead to memory leaks.

> [!CAUTION]
> Forgetting to clean up side effects from `useEffect` is a common source of bugs in React applications. Always consider what should happen if the component unmounts.

Let's make our hook more robust by adding cleanup logic. For this iteration, you'll be working in **`src/hooks/useFetch.js`** again.

1.  **Create an AbortController**: Inside the `useEffect` hook (but before your `fetchData` function), create a new `AbortController`.
2.  **Pass the signal to Axios**: In your `axios.get` call, pass the controller's `signal` in the options object.
3.  **Return a cleanup function**: At the end of your `useEffect`, return a cleanup function. This function will be called when the component unmounts or when the `url` changes. Inside this function, call `controller.abort()`.
4.  **Handle AbortError**: When a request is aborted, Axios throws an error. We don't want to treat this as a real error in our UI. Update your `catch` block to ignore cancellation errors.

<details>
  <summary>Click for Solution</summary>

```jsx
// src/hooks/useFetch.js
import { useState, useEffect } from 'react';
import axios from 'axios';

export function useFetch(url) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController(); // 1. Create AbortController

    const fetchData = async () => {
      try {
        setLoading(true);
        // 2. Pass signal to axios
        const response = await axios.get(url, { signal: controller.signal });
        setData(response.data);
        setError(null);
      } catch (err) {
        // 4. Handle cancellation error
        if (axios.isCancel(err)) {
          console.log('Request canceled:', err.message);
          return;
        }
        setError(err);
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // 3. Return cleanup function
    return () => {
      controller.abort();
    };
  }, [url]);

  return { data, loading, error };
}
```

</details>

<br>

---

### **Iteration 5 (Bonus) – Create a Custom Hook: `useAccordion` for Toggling Sections**

In many UIs, especially dashboards, sidebars, or FAQs, you'll want to toggle the visibility of content—commonly known as an **accordion** pattern. Instead of managing `isOpen` state manually in every component, let's abstract the logic into a **reusable custom hook** called `useAccordion`.

> [!TIP]
> This is a great example of how **custom hooks promote DRY code** and improve maintainability across multiple components.

You’ll implement this in **`src/hooks/useAccordion.js`**.

#### ✅ Your Tasks:

1. **Create the hook structure**: Define a hook named `useAccordion` that internally manages a boolean state (`isOpen`).
2. **Add toggle behavior**: Expose a `toggle` function that flips the state.
3. **Expose helper controls**: Include optional `open()` and `close()` methods for extra control.
4. **Return a simple API**: The hook should return `{ isOpen, toggle, open, close }`.

---

<details>
  <summary>Click for Solution</summary>

```jsx
// src/hooks/useAccordion.js
import { useState, useCallback } from 'react';

export function useAccordion(initialState = false) {
  const [isOpen, setIsOpen] = useState(initialState);

  const toggle = useCallback(() => setIsOpen(prev => !prev), []);
  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  return { isOpen, toggle, open, close };
}
```

---

#### 🧪 Example Usage:

```jsx
// src/components/FAQ.jsx
import { useAccordion } from '../hooks/useAccordion';

export function FAQItem() {
  const { isOpen, toggle } = useAccordion();

  return (
    <div>
      <button onClick={toggle} aria-expanded={isOpen}>
        {isOpen ? 'Hide Answer' : 'Show Answer'}
      </button>
      {isOpen && <p>This is the answer to the question.</p>}
    </div>
  );
}
```

---

> [!IMPORTANT]
> A well-designed custom hook should return only the logic and values needed for a component—not JSX or UI.

This pattern makes your UI code cleaner and separates concerns between **UI rendering** and **state management**.

</details>

---

<br>

Your `useFetch` hook is now production-ready! It's generic, reusable, and safely handles side effects.

<br>

**Happy coding!** :heart:

<br>

## Extra Resources

- **Official React Docs on Custom Hooks**: The best place to start for a deep dive into the concept. [Read it here](https://react.dev/learn/reusing-logic-with-custom-hooks).
- **react-use**: An excellent open-source library full of useful, production-ready custom hooks. It's a great place to see more examples and get inspiration. [Check it out on GitHub](https://github.com/streamich/react-use).
- **Axios Cancellation Docs**: Learn more about how to cancel requests with Axios. [Read the docs](https://axios-http.com/docs/cancellation).
