"use client";
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft } from "lucide-react";
import useAuth from "@/functions/useAuth";
import { useEffect } from "react";
import { Role } from "@/types/Supabase";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
    const router = useRouter();
    const { profile } = useAuth();
    useEffect(()=>{
        //
        if(profile?.role == Role.normal){
            router.push("/dashboard/user");
        }
    },[profile]);

    return (
        <div className="min-h-screen bg-white flex items-center justify-center p-4">
            <div className="w-full max-w-5xl flex flex-col md:flex-row items-center gap-12 p-4">
                {/* Professor Character */}
                <div className="w-96 h-96 md:w-[30rem] md:h-[30rem] lg:w-[40rem] lg:h-[40rem] relative">
                    <Image
                        src="/cat.png"
                        alt="neko"
                        fill
                        className="object-contain"
                    />
                </div>

                {/* Menu Options */}
                <div className="flex flex-col gap-6 w-full max-w-md">
                    <div className="w-full flex space-x-4">
                        <Link href="/dashboard/admin/" className="w-full">
                            <button className="w-full border border-[#212121] rounded-md p-6 text-center hover:bg-gray-50 transition-colors shadow-md">
                                <span className="text-2xl font-bold">招待されているページ一覧</span>
                            </button>
                        </Link>
                    </div>
                    <div className="w-full flex space-x-4">
                        <Link href="/dashboard/admin/report" className="w-full">
                            <button className="w-full border border-[#212121] rounded-md p-6 text-center hover:bg-gray-50 transition-colors shadow-md">
                                <span className="text-2xl font-bold">学習状況一覧</span>
                            </button>
                        </Link>
                    </div>
                    <div className="w-full flex space-x-4">
                        <Link href="/dashboard/admin/config" className="w-full">
                            <button className="w-full border border-[#212121] rounded-md p-6 text-center hover:bg-gray-50 transition-colors shadow-md">
                                <span className="text-2xl font-bold">設定変更</span>
                            </button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
