// Carte de visite pages don't use the app's pt-16 padding
// (no navbar shown — handled by ConditionalNavbar)
export default function CarteLayout({ children }: { children: React.ReactNode }) {
  return <div className="-mt-16">{children}</div>
}
