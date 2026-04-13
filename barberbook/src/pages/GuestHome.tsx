
import { Link } from "react-router-dom";
import { Scissors, CalendarCheck, ShieldCheck, Sparkles } from "lucide-react";

import UserHeroCarousel from "@/components/UserHeroCarousel";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

// Senin görsellerin (path’leri aynıysa direkt çalışır)
import slide1 from "../assets/slider/slide1.jpg";
import slide2 from "../assets/slider/slide2.jpg";
import slide3 from "../assets/slider/slide3.jpg";
import slide4 from "../assets/slider/slide4.jpg";
import slide5 from "../assets/slider/slide5.jpg";

export default function GuestHome() {
  const slides = [
    {
      id: "s1",
      src: slide1,
      alt: "BarberBook - hızlı randevu",
      badge: "Hızlı",
      title: "Randevu almanın en kısa yolu",
      subtitle: "Hizmet seç → saat seç → onayla.",
    },
    {
      id: "s2",
      src: slide2,
      alt: "Hizmet seçimi",
      badge: "Kolay",
      title: "Saç • Sakal • Bakım",
      subtitle: "İhtiyacını seç, saniyeler içinde randevunu oluştur.",
    },
    {
      id: "s3",
      src: slide3,
      alt: "Takvim ve uygun saatler",
      badge: "Uygun Saatler",
      title: "Uygun saatleri anında gör",
      subtitle: "Boş slotları yakala, beklemeden planla.",
    },
    {
      id: "s4",
      src: slide4,
      alt: "Kaliteli hizmet",
      badge: "Özen",
      title: "Detaylara önem veren berberler",
      subtitle: "Kafa yapına uygun kesim, temiz işçilik.",
    },
    {
      id: "s5",
      src: slide5,
      alt: "Kişisel deneyim",
      badge: "Sana Özel",
      title: "Sana uygun stil, sana uygun zaman",
      subtitle: "Randevunu yönet: detay, yeniden planla, iptal.",
    },
  ];

  return (
    <div className="space-y-6">
      {/* HERO CAROUSEL */}
      <UserHeroCarousel slides={slides} autoMs={3500} />

      {/* MAIN CTA */}
      <Card className="border-border bg-card">
        <CardHeader className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">Yeni</Badge>
            <Badge variant="outline">Light/Dark uyumlu</Badge>
          </div>

          <CardTitle className="text-2xl md:text-3xl">
            Berber randevunu 1 dakikada planla
          </CardTitle>

          <CardDescription className="text-muted-foreground">
            BarberBook ile uygun saatleri gör, randevunu oluştur ve tek yerden yönet.
            Kayıt olunca randevu geçmişin ve yaklaşan randevun otomatik görünür.
          </CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Button asChild variant="default" size="lg">
            <Link to="/book">Randevu Al</Link>
          </Button>

          <Button asChild variant="secondary" size="lg">
            <Link to="/login">Giriş Yap / Kayıt Ol</Link>
          </Button>

          <Button asChild variant="outline" size="lg">
            <Link to="/login">Hizmetleri Gör</Link>
          </Button>
        </CardContent>
      </Card>

      {/* 3 STEP */}
      <div className="grid gap-4 md:grid-cols-3">
        {[
          {
            t: "1) Hizmet seç",
            d: "Saç, sakal, bakım… ihtiyacına göre seçimini yap.",
            icon: Scissors,
          },
          {
            t: "2) Saat seç",
            d: "Uygun saatlerden birini seç, not ekle ve devam et.",
            icon: CalendarCheck,
          },
          {
            t: "3) Onayla",
            d: "Randevunu oluştur. İstersen sonradan yeniden planla veya iptal et.",
            icon: ShieldCheck,
          },
        ].map((x) => (
          <Card key={x.t} className="border-border bg-card">
            <CardHeader className="space-y-2">
              <div className="flex items-center gap-2">
                <x.icon className="h-5 w-5 text-muted-foreground" />
                <CardTitle className="text-lg">{x.t}</CardTitle>
              </div>
              <CardDescription className="text-muted-foreground">{x.d}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>

      {/* TRUST / VALUE */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-muted-foreground" />
            Neden BarberBook?
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Kullanıcıyı “hemen randevuya” götüren sade bir deneyim.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <Separator />

          <div className="grid gap-3 md:grid-cols-2">
            {[
              {
                t: "Hızlı ve net akış",
                d: "Gereksiz adım yok. Hizmet → saat → onay.",
              },
              {
                t: "Randevu yönetimi",
                d: "Randevularını görüntüle, iptal et veya yeniden planla.",
              },
              {
                t: "Tema uyumlu tasarım",
                d: "Light/Dark modda okunabilir, modern arayüz.",
              },
              {
                t: "Güvenli oturum",
                d: "Giriş yapınca verilerin hesabında tutulur.",
              },
            ].map((f) => (
              <div key={f.t} className="rounded-xl border border-border bg-card p-4">
                <div className="font-medium">{f.t}</div>
                <div className="mt-1 text-sm text-muted-foreground">{f.d}</div>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-muted-foreground">
              Hazırsan ilk randevunu oluşturalım.
            </div>
            <Button asChild variant="default">
              <Link to="/book">Randevu Al</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
