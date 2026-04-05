import PageTransition   from '../components/ui/PageTransition'
import Navbar           from '../components/Navbar'
import Hero             from '../components/Hero'
import InternshipInfo   from '../components/InternshipInfo'
import Footer           from '../components/Footer'

export default function Home() {
  return (
    <PageTransition>
      <div className="min-h-screen mesh-bg">
        <Navbar />
        <main>
          <Hero />
          <InternshipInfo />
        </main>
        <Footer />
      </div>
    </PageTransition>
  )
}