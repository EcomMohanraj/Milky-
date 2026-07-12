import React from "react";
import Image from "next/image";
import { Leaf, CheckSquare, MapPin } from "lucide-react";

export default function AboutFarmPage() {
  const team = [
    {
      name: "Ramesh P.",
      role: "Farm Founder & Lead Cultivator",
      bio: "Over 12 years of experience in tropical mushroom spawn run and bed cultivation. Ramesh handles substrate sterilization quality controls.",
      image: "/images/about/ramesh_founder.webp",
    },
    {
      name: "Dr. Anjali Devi",
      role: "Mushroom Mycologist & Quality Manager",
      bio: "Anjali leads our sterile grain spawn laboratory, ensuring spawn purity and selecting high-yield Calocybe indica cultures.",
      image: "/images/about/anjali_mycologist.webp",
    },
  ];

  const certifications = [
    {
      title: "100% Organic Certified",
      desc: "Our cultivation processes strictly employ natural substrates. No chemical growth accelerators or synthetics are used.",
    },
    {
      title: "FSSAI Food Quality Standard",
      desc: "Licensed under Food Safety and Standards Authority of India (FSSAI), Lic. No. 22426292000031. We maintain strict protocols for hygienic harvesting, packing, and dispatch operations.",
    },
    {
      title: "Zero Waste Agriculture",
      desc: "Used mushroom compost (spent substrate straw) is recycled as rich organic compost for neighboring vegetable farms.",
    },
  ];

  const galleryImages = [
    "/images/fresh_milky_mushrooms.webp",
    "/images/about/gallery_1.webp",
    "/images/about/gallery_2.webp",
    "/images/about/gallery_3.webp",
  ];

  return (
    <div className="container mx-auto px-4 md:px-6 py-10 flex-grow flex flex-col gap-16 pb-20">
      
      {/* Page Header / Intro */}
      <section className="text-center max-w-3xl mx-auto flex flex-col gap-3">
        <span className="inline-flex items-center gap-1 text-xs font-black uppercase tracking-wider text-primary justify-center">
          <Leaf className="w-3.5 h-3.5" />
          Our Heritage
        </span>
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-foreground font-outfit">
          About Milky Mushrooms Farm
        </h1>
        <p className="text-sm md:text-base text-muted-foreground leading-relaxed mt-2">
          Grown directly in the warm tropical plains of Dindigul, Tamil Nadu, our farm leverages natural ambient temperatures and organic residues to raise superior Milky Mushrooms (Calocybe indica) for Indian households.
        </p>
      </section>

      {/* Farm Story Module */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center bg-card border border-border/60 p-6 md:p-10 rounded-3xl shadow-sm">
        <div className="relative h-[280px] md:h-[400px] rounded-2xl overflow-hidden bg-secondary">
          <Image
            src="/images/about/farm_landscape.webp"
            alt="Organic farming landscapes"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>
        <div className="flex flex-col gap-5">
          <div className="inline-flex items-center gap-1.5 text-xs text-primary font-bold">
            <MapPin className="w-4.5 h-4.5" />
            Dindigul District, Tamil Nadu
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-foreground leading-tight font-outfit">
            Harvesting Health, Conserving Nature
          </h2>
          <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
            Our farm was founded on a simple vision: to make high-protein, tropical mushroom crops accessible, clean, and delicious. Milky Mushrooms are the only edible mushrooms native to India that thrive in warmer temperatures, requiring fewer resource inputs and minimal carbon footprint compared to other varieties.
          </p>
          <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
            By pasteurizing paddy straw collected from local rice fields, we support neighboring farmers while creating a nutrient-dense casing beds environment. The results are pure, bright white, thick mushrooms that carry a signature organic taste and long shelf life.
          </p>
          
          <div className="flex gap-4 items-center border-t border-border/80 pt-5 mt-2">
            <div className="flex flex-col">
              <span className="font-black text-2xl text-primary">12+</span>
              <span className="text-[10px] text-muted-foreground uppercase font-bold">Years of Cultivation</span>
            </div>
            <div className="w-px h-10 bg-border" />
            <div className="flex flex-col">
              <span className="font-black text-2xl text-primary">100%</span>
              <span className="text-[10px] text-muted-foreground uppercase font-bold">Pesticide Free</span>
            </div>
          </div>
        </div>
      </section>

      {/* Cultivation Process Timeline */}
      <section className="flex flex-col gap-10">
        <div className="text-center max-w-xl mx-auto flex flex-col gap-2">
          <span className="text-xs font-black uppercase tracking-wider text-primary">High Hygiene Standards</span>
          <h2 className="text-2xl md:text-3xl font-extrabold text-foreground font-outfit">
            Mushroom Cultivation Stages
          </h2>
          <p className="text-xs text-muted-foreground">
            We follow laboratory-grade sterile steps to guarantee optimal mycelium runs and block disease outbreaks.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-card border border-border/60 p-5 rounded-2xl flex flex-col gap-3 shadow-sm">
            <span className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">A</span>
            <h3 className="font-bold text-sm text-foreground">Sorghum Spawn Prep</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Sorghum grains are sterilized in high-pressure autoclaves and inoculated with pure mother cultures of Calocybe indica.
            </p>
          </div>
          <div className="bg-card border border-border/60 p-5 rounded-2xl flex flex-col gap-3 shadow-sm">
            <span className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">B</span>
            <h3 className="font-bold text-sm text-foreground">Substrate Pasteurization</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Organic paddy straw is sliced, hydrated, and pasteurized via hot-water steam cycles to remove wild spores.
            </p>
          </div>
          <div className="bg-card border border-border/60 p-5 rounded-2xl flex flex-col gap-3 shadow-sm">
            <span className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">C</span>
            <h3 className="font-bold text-sm text-foreground">Bed Layering & Casing</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Inoculated spawn and straw are packed into cylinders. Once colonized, beds are sealed with sterilized loam soil (casing).
            </p>
          </div>
          <div className="bg-card border border-border/60 p-5 rounded-2xl flex flex-col gap-3 shadow-sm">
            <span className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">D</span>
            <h3 className="font-bold text-sm text-foreground">Humidity Harvesting</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Beds are watered in temperature chambers (30-35°C, 85% humidity) to trigger rich milky mushrooms for hand harvesting.
            </p>
          </div>
        </div>
      </section>

      {/* Certifications and Quality Standards */}
      <section className="bg-secondary/15 dark:bg-muted/10 border-y border-border/40 py-16 -mx-4 md:-mx-6 px-4 md:px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 flex flex-col gap-4 justify-center">
            <span className="text-xs font-black uppercase tracking-wider text-primary">Quality Audited</span>
            <h2 className="text-2xl md:text-3xl font-extrabold text-foreground leading-tight font-outfit">
              Certifications & Standards
            </h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              We comply with standard food safety measures to deliver the clean products to our buyers.
            </p>
          </div>
          
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-5">
            {certifications.map((cert, idx) => (
              <div key={idx} className="bg-card border border-border/60 p-5 rounded-2xl shadow-sm flex flex-col gap-2.5">
                <CheckSquare className="w-5 h-5 text-primary shrink-0" />
                <h4 className="font-bold text-xs text-foreground uppercase tracking-wide">{cert.title}</h4>
                <p className="text-[11px] text-muted-foreground leading-relaxed">{cert.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* The Team */}
      <section className="flex flex-col gap-10">
        <div className="text-center max-w-xl mx-auto flex flex-col gap-2">
          <span className="text-xs font-black uppercase tracking-wider text-primary">Farm Staff</span>
          <h2 className="text-2xl md:text-3xl font-extrabold text-foreground font-outfit">
            Meet Our Cultivators
          </h2>
          <p className="text-xs text-muted-foreground">
            Dedicated mycologists and farm managers striving to provide chemical-free fresh harvests every day.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto w-full">
          {team.map((member, idx) => (
            <div key={idx} className="bg-card border border-border/60 p-5 rounded-2xl shadow-sm flex flex-col sm:flex-row gap-5 items-center">
              <div className="relative w-28 h-28 rounded-full overflow-hidden shrink-0 bg-secondary">
                <Image
                  src={member.image}
                  alt={member.name}
                  fill
                  className="object-cover"
                  sizes="112px"
                />
              </div>
              <div className="flex flex-col gap-1.5 text-center sm:text-left">
                <h3 className="font-bold text-sm text-foreground">{member.name}</h3>
                <span className="text-xs font-bold text-primary">{member.role}</span>
                <p className="text-[11px] text-muted-foreground leading-relaxed mt-1">{member.bio}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Farm Gallery */}
      <section className="flex flex-col gap-8 pb-10">
        <h2 className="text-2xl font-extrabold text-center text-foreground font-outfit">Farm Photo Gallery</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {galleryImages.map((src, idx) => (
            <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden border border-border/60 bg-secondary shadow-sm hover:shadow-md transition-all">
              <Image
                src={src}
                alt={`Mushroom farm gallery ${idx + 1}`}
                fill
                className="object-cover hover:scale-105 transition-transform duration-300"
                sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
              />
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
