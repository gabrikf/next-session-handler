import { useEffect } from "react";
import { useSession } from "../hooks/AuthContext";
import { setupAPIClient } from "../services/api";
import { api } from "../services/apiClient";
import { withSSRAuthenticated } from "../utils/withSSRAuthenticated";

export default function Metrics() {
  const { user } = useSession();
  return (
    <div>
      <h1>Metrics</h1>
    </div>
  );
}

export const getServerSideProps = withSSRAuthenticated(
  async (ctx) => {
    const serverSideAPI = setupAPIClient(ctx);

    const response = await serverSideAPI.get("/me");
    console.log(response.data);

    return {
      props: {},
    };
  },
  {
    roles: ["administrator"],
    permissions: ["metrics.list"],
  }
);
