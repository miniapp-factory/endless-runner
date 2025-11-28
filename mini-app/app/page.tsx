import { generateMetadata } from "@/lib/farcaster-embed";
import Game from "@/components/game";

export { generateMetadata };

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen gap-4 px-4">
      <Game />
    </main>
  );
}
