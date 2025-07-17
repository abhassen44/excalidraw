import { ReactNode } from "react";

export function IconButton({icon, onClick,activated}: {icon: ReactNode, onClick: () => void, activated: boolean}) {
    return (
        <button onClick={onClick} className={`w-10 h-10 bg-${activated ? "blue-500" : "red-500"} text-white flex justify-center items-center rounded-2xl`}>{icon}</button>
    )
}