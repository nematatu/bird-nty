"use client"

import { useState, useEffect } from "react"

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
  // ローカルストレージから値を取得する関数
  const readValue = (): T => {
    // ブラウザ環境でない場合は初期値を返す
    if (typeof window === "undefined") {
      return initialValue
    }

    try {
      // ローカルストレージから値を取得
      const item = window.localStorage.getItem(key)
      // 値が存在する場合はパースして返す、存在しない場合は初期値を返す
      return item ? (JSON.parse(item) as T) : initialValue
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error)
      return initialValue
    }
  }

  // 状態を初期化
  const [storedValue, setStoredValue] = useState<T>(initialValue)

  // 初回マウント時にローカルストレージから値を読み込む
  useEffect(() => {
    setStoredValue(readValue())
  }, [])

  // 値を設定する関数
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      // 新しい値を計算
      const newValue = value instanceof Function ? value(storedValue) : value

      // ローカルストレージに保存
      if (typeof window !== "undefined") {
        window.localStorage.setItem(key, JSON.stringify(newValue))
      }

      // 状態を更新
      setStoredValue(newValue)
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error)
    }
  }

  return [storedValue, setValue]
}
