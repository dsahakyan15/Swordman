import { Route, Routes } from 'react-router-dom'

import { AuctionPage } from '../features/auction/AuctionPage'
import { HomePage } from '../features/home/HomePage'
import { AppShell } from './AppShell'

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<HomePage />} />
        <Route path="auction" element={<AuctionPage />} />
      </Route>
    </Routes>
  )
}
