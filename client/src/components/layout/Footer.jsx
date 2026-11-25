import { Link } from 'react-router-dom'
import { Car, Phone, Mail, MapPin, Facebook, Instagram, Twitter } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2 font-bold text-xl mb-4">
              <div className="bg-blue-600 p-1.5 rounded-lg">
                <Car className="h-5 w-5 text-white" />
              </div>
              VELOX RENTAL
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed">Platform sewa kendaraan terpercaya dengan armada premium dan pelayanan terbaik di Indonesia.</p>
            <div className="flex gap-3 mt-4">
              {[Facebook, Instagram, Twitter].map((Icon, i) => (
                <a key={i} href="#" className="p-2 bg-gray-800 hover:bg-blue-600 rounded-lg transition-colors">
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Navigasi</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              {[['/', 'Beranda'], ['/vehicles', 'Katalog Kendaraan'], ['/login', 'Masuk'], ['/register', 'Daftar']].map(([to, label]) => (
                <li key={to}><Link to={to} className="hover:text-white transition-colors">{label}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Layanan</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              {['Sewa Harian', 'Sewa Mingguan', 'Sewa Bulanan', 'Sewa Korporat', 'Antar Jemput'].map(s => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Kontak</h4>
            <ul className="space-y-3 text-sm text-gray-400">
              <li className="flex items-start gap-2"><MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" /><span>Jl. Sudirman No. 123, Jakarta Pusat 10220</span></li>
              <li className="flex items-center gap-2"><Phone className="h-4 w-4" /><span>+62 21 1234 5678</span></li>
              <li className="flex items-center gap-2"><Mail className="h-4 w-4" /><span>info@veloxrental.com</span></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-12 pt-8 text-center text-sm text-gray-500">
          <p>© {new Date().getFullYear()} VELOX RENTAL. Hak cipta dilindungi undang-undang.</p>
        </div>
      </div>
    </footer>
  )
}
