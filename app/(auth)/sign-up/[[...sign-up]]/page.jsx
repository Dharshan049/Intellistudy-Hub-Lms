import { SignUp } from '@clerk/nextjs'

export default function Page() {
  return (
      <div className="flex items-center justify-center h-screen transition-colors duration-300 dark:bg-gradient-to-br dark:from-[#1a0235] dark:via-[#3b0764] dark:to-[#1a0235] bg-gradient-to-br from-[#e2d6f8] via-[#d4afff] to-[#e2d6f8] text-black dark:text-white">
          <SignUp />
      </div>
  );
}