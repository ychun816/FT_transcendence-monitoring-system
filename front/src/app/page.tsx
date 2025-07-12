"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "./HomePage.module.css"; // Optionnel si vous voulez ajouter du style

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Rediriger immédiatement vers la page de login
    router.replace("/login");
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Chargement...</p>
      </div>
    </div>
  );
}
