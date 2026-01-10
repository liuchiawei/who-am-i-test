import Link from "next/link";
import { Button } from "@/components/ui/button";
export default function Home() {
  return (
    <main className="h-screen p-4 flex flex-col items-center justify-center gap-4">
      <div className="flex flex-col items-center justify-center gap-2">
        <h1 className="text-5xl font-bold font-sans">心理測驗</h1>
        <p className="text-lg text-muted-foreground">選擇一個測驗開始</p>
      </div>
      <div className="grid gap-4">
        <Link href="/tests/adhd">
          <Button>ADHD</Button>
        </Link>
      </div>
    </main>
  );
}
