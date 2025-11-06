import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="max-w-2xl mx-auto text-center space-y-8">
        <h1 className="text-5xl md:text-6xl font-serif text-gray-900 tracking-tight">
          OneLittleThing
        </h1>

        <p className="text-xl md:text-2xl text-gray-700 font-light">
          Everyday moments, beautifully remembered.
        </p>

        <p className="text-lg text-gray-600 max-w-xl mx-auto">
          Capture one moment about your child each day. Whether it's text, a photo, or short audio —
          build a private timeline of memories that matter.
        </p>

        <div className="flex gap-4 justify-center pt-8">
          <Link
            href="/signup"
            className="bg-rose text-white px-8 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity"
          >
            Get Started
          </Link>
          <Link
            href="/login"
            className="bg-sand text-gray-800 px-8 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity"
          >
            Sign In
          </Link>
        </div>
      </div>

      <footer className="absolute bottom-8 text-sm text-gray-500">
        <p>This app isn't about posting or perfection — it's about presence.</p>
      </footer>
    </main>
  );
}
