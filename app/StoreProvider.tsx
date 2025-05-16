'use client'
import { useRef } from "react"
import { Provider } from "react-redux"
import { persistor, store } from "@/lib/store"
import { PersistGate } from "redux-persist/integration/react"

export default function StoreProvider({
    children
}: {
    children: React.ReactNode
}) {
    // const storeRef = useRef<AppStore | null>(null)
    // if (!storeRef.current) {
    //     storeRef.current = makeStore()
    // }

    return <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
            {children}
        </PersistGate>
    </Provider>
}