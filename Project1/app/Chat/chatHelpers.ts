import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebaseConfig";

export const fetchPlayerNames = async (
  uids: string[],
  existing: { [uid: string]: string },
): Promise<{ [uid: string]: string }> => {
  const newUids = uids.filter((uid) => !existing[uid]);
  if (newUids.length === 0) return existing;

  const names: { [uid: string]: string } = {};
  for (const uid of newUids) {
    try {
      const userDoc = await getDoc(doc(db, "users", uid));
      names[uid] = userDoc.exists() ? userDoc.data().name || "Onbekend" : "Onbekend";
    } catch {
      names[uid] = "Onbekend";
    }
  }
  return { ...existing, ...names };
};
