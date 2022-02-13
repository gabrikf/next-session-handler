import { GetServerSideProps } from "next";
import { redirect } from "next/dist/server/api-utils";
import { parseCookies } from "nookies";
import { FormEvent, useState } from "react";
import { useSession } from "../hooks/AuthContext";
import { withSSRGuest } from "../utils/withSSRGuest";
import styles from "./Login.module.css";

export default function Home() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { signIn } = useSession();

  async function handleSubmitForm(event: FormEvent) {
    event.preventDefault();
    const data = {
      email,
      password,
    };
    await signIn(data);
  }
  return (
    <form onSubmit={handleSubmitForm} className={styles.container}>
      <label>email</label>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <label>senha</label>
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button type="submit">submit</button>
    </form>
  );
}

export const getServerSideProps = withSSRGuest(async (ctx) => {
  return {
    props: {},
  };
});
