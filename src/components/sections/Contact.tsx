import React from "react";
import { Mail, Phone } from "lucide-react";

const contacts = [
  {
    name: "Loai Abdalslam Alazab",
    email: "loaiabdalslam@gmail.com",
    phone: "+20 1211268396",
  },
  {
    name: "Hamdy Waleed Abd-Elhalim",
    email: "hamdywaleed20@gmail.com",
    phone: "+20 150 514 2388",
  },
];

const Contact: React.FC = () => {
  return (
    <section id="contact" className="py-20">
      <div className="text-center mb-10">
        <h2 className="text-3xl md:text-4xl font-semibold">Contact Us</h2>
        <p className="text-muted-foreground mt-3">Request a demo or consultation</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {contacts.map((c) => (
          <article key={c.email} className="rounded-xl border border-border/60 bg-background/30 backdrop-blur-md p-6">
            <h3 className="text-xl font-semibold">{c.name}</h3>
            <div className="mt-4 space-y-2">
              <a className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors" href={`mailto:${c.email}`}>
                <Mail className="h-4 w-4" /> {c.email}
              </a>
              <a className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors" href={`tel:${c.phone.replace(/\s/g, '')}`}>
                <Phone className="h-4 w-4" /> {c.phone}
              </a>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

export default Contact;
