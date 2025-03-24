"use client";
import { cn } from '@/lib/utils';
import { Calendar, Car, Cog, LayoutDashboard } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react'
const DASHBOARD_ROUTES = [
    {
        label: "Dashboard",
        icon: LayoutDashboard,
        href: "/admin",

    },
    {
        label: "Cars",
        icon: Car,
        href: "/admin/cars",
    },
    {
        label: "Test Drives",
        icon: Calendar,
        href: "/admin/test-drives",
    },
    {
        label: "Settings",
        icon: Cog,
        href: "/admin/settings",
    }
]

const Sidebar = () => {
    const pathname = usePathname()
    return (
        <>
            <div className='hidden md:flex h-full flex-col overflow-y-auto bg-white shadow-sm border-r'>
                {
                    DASHBOARD_ROUTES.map((r, i) => {
                        return <Link key={r.href} href={r.href} className={cn("flex items-center pl-6  text-sm font-medium text-slate-500 hover:bg-slate-100/50 h-12", pathname === r.href ? "bg-blue-100/50 text-blue-600 hover:bg-blue-100" : "")}>
                            <r.icon className="h-5 w-5" />
                            <span className="ml-2">{r.label}</span>
                        </Link>
                    })}
            </div >
            <div className='md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t flex justify-around items-center h-16'>
                {
                    DASHBOARD_ROUTES.map((r, i) => {
                        return <Link key={r.href} href={r.href} className={cn("flex items-center justify-center text-slate-500 text-xs font-medium transition-all py-1 flex-1 ", pathname === r.href ? " text-blue-600 " : "")}>
                            <r.icon className="h-5 w-5" />
                            <span className="ml-2">{r.label}</span>
                        </Link>
                    })}
            </div>
        </>
    )
}

export default Sidebar