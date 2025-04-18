import {
  ClerkProvider,
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import { Button } from "./ui/button";
import { ArrowLeft, CarFront, Heart, Layout } from "lucide-react";
import { CheckUser } from "@/lib/CheckUser";

const Header = async ({ IsAdminPage = false }) => {
  const user = await CheckUser();

  const isAdmin = user?.role === "ADMIN";
  return (
    <header className="fixed top-0 w-full bg-white backdrop-blur-md z-50 border-b">
      <nav className="mx-auto px-4 py-4 flex items-center justify-between">
        <Link href={IsAdminPage ? "/admin" : "/"} className="flex">
          <Image
            src="/logo/logo.png"
            alt="logo"
            width={200}
            height={40}
            className="h-11  w-auto object-contain  opacity-90"
            priority
          />

          {IsAdminPage && (
            <span className="text-xs font-extralight mt-4 lg:mt-0">Admin</span>
          )}
        </Link>

        <div className="flex items-center space-x-4">
          {IsAdminPage ? (
            <Link href="/">
              <Button
                variant="outline"
                className=" flex items-center gap-2 cursor-pointer"
              >
                <ArrowLeft size={18} />
                {/* <span>main web</span> */}
              </Button>
            </Link>
          ) : (
            <SignedIn>
              <Link href="/saved-cars">
                <Button className="cursor-pointer">
                  <Heart size={18} />
                  <span className="hidden md:inline ">Saved Cars</span>
                </Button>
              </Link>
              {!isAdmin ? (
                <Link href="/my-reserve">
                  <Button variant="outline" className="cursor-pointer">
                    <CarFront size={18} />
                    <span className="hidden md:inline cursor-pointer">
                      My Reservations
                    </span>
                  </Button>
                </Link>
              ) : (
                <Link href="/admin">
                  <Button variant="outline" className="cursor-pointer">
                    <Layout size={18} />
                    <span className="hidden md:inline cursor-pointer">
                      Admin
                    </span>
                  </Button>
                </Link>
              )}
            </SignedIn>
          )}
          <SignedOut>
            <SignInButton forceRedirectUrl="/">
              <Button variant="outline" className="cursor-pointer">
                Login
              </Button>
            </SignInButton>
          </SignedOut>

          <SignedIn>
            <UserButton
              appearance={{
                elements: {
                  avatrBox: "w-10 h-10",
                },
              }}
            />
          </SignedIn>
        </div>
      </nav>
    </header>
  );
};

export default Header;
