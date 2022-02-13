import { destroyCookie } from "nookies";
import { useEffect } from "react";
import { Can } from "../components/can";
import { useSession } from "../hooks/AuthContext";
import { useCan } from "../hooks/useCan";
import { setupAPIClient } from "../services/api";
import { api } from "../services/apiClient";
import { AuthTokenError } from "../services/errors/AuthTokenError";
import { withSSRAuthenticated } from "../utils/withSSRAuthenticated";

export default function Dashboard() {
  const permission = useCan({
    roles: ["administrator", "editor"],
  });

  useEffect(() => {
    api.get("/me").then((response) => console.log(response));
  }, []);
  const { user, signOut } = useSession();
  return (
    <div>
      <h1>dashboard {user?.email}</h1>
      <button onClick={signOut} type="submit">
        sair
      </button>
      <Can permissions={["metrics.list"]}>
        <h1>teste2</h1>
      </Can>

      {permission && <h1>teste para poder ver</h1>}
    </div>
  );
}

export const getServerSideProps = withSSRAuthenticated(async (ctx) => {
  const serverSideAPI = setupAPIClient(ctx);

  const response = await serverSideAPI.get("/me");
  console.log(response.data);

  return {
    props: {},
  };
});
