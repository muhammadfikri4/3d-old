import "./App.css";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import RootViews from "./components/RootViews";
import HomeViews from "./components/HomeViews";
import Type2 from "./components/type2";
import Type1 from "./components/type1";

const router = createBrowserRouter([
  {
    path: "/",
    element: <RootViews />,
    children: [
      {
        path: "/",
        element: <HomeViews />,
      },
      {
        path: "/type-1",
        element: <Type1 />,
      },
      {
        path: "/type-2",
        element: <Type2 />,
      },
    ],
  },
]);

function App() {
  // useEffect(() => {
  //   useGeo();
  // }, []);
  return (
    <>
      <RouterProvider router={router} />
    </>
  );
}

export default App;
