/**
 * Connexion PostgreSQL directe à Railway — utilisée uniquement pour l'auth
 * (vérification mot de passe, création compte, changement de mot de passe).
 * Toutes les opérations métier passent par le backend séparé (lib/api.ts).
 */
import postgres from "postgres"

// En local on peut passer DATABASE_URL dans .env.local
const sql = postgres(process.env.DATABASE_URL!, {
  max: 5,
  idle_timeout: 20,
  connect_timeout: 10,
})

export { sql }
