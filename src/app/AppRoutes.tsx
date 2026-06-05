import { Route, Routes } from 'react-router-dom'

import { AuctionPage } from '../features/auction/AuctionPage'
import { HomePage } from '../features/home/HomePage'
import { NotFoundPage } from '../features/not-found/NotFoundPage'
import { PortfolioPage } from '../features/portfolio/PortfolioPage'
import { AppShell } from './AppShell'

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<HomePage />} />
        <Route path="auction" element={<AuctionPage />} />
        <Route path="portfolio" element={<PortfolioPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
