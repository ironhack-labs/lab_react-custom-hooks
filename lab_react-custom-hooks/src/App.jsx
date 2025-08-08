// src/App.jsx
import PublicGists from "./components/PublicGists";
import UserGists from "./components/UserGists";
import useAccordion from "./hooks/useAccordion";

function App() {
  const [isShow, toggle, setIsOpen] = useAccordion();
  return (
    <div>
      <h1>React Custom Hooks Lab</h1>
      <button onClick={() => setIsOpen(true)}>Show</button>
      <button onClick={() => setIsOpen(false)}>Hide</button>

      <button onClick={toggle}>{isShow ? "Hide" : "Show"}</button>
      {isShow && <PublicGists />}
      <hr />
      {isShow && <UserGists />}
    </div>
  );
}

export default App;
