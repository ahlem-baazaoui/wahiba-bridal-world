"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Phone, MapPin } from "lucide-react";
import { toast } from "sonner";
import { client } from "@/lib/client";
import StateMap from "@/components/StateMap";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault(); 
    const contactDoc = {
      _type: "contact",
      name: formData.name,
      email: formData.email,
      phone: Number(formData.phone),
      subject: formData.subject,
      message: formData.message
    };
    try {
          await client.create(contactDoc);
    } catch (error) {
      toast.error("There was an error sending your message. Please try again.");
      console.error(error);
    }
    setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
    toast.success("Message sent successfully!");
  };

  return (
    <div className="container mx-auto px-4 py-16 mt-16">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-5xl font-bold mb-4"
        >
          Contactez-nous
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-gray-600 max-w-2xl mx-auto"
        >
          Vous avez des questions ? Nous serions ravis de vous entendre. Envoyez-nous un message et nous vous répondrons dès que possible.
        </motion.p>
      </div>

      <div className="grid md:grid-cols-2 gap-12">
        {/* Contact Form */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-2">
                Nom
              </label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                placeholder="Votre nom"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                placeholder="votre.email@exemple.com"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                Téléphone
              </label>
              <Input
                id="phone"
                type="number"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
                placeholder="Votre numéro de téléphone"
              />
            </div>
            <div>
              <label htmlFor="subject" className="block text-sm font-medium mb-2">
                Sujet
              </label>
              <Input
                id="subject"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                required
                placeholder="Sujet de votre message"
              />
            </div>
            <div>
              <label htmlFor="message" className="block text-sm font-medium mb-2">
                Message
              </label>
              <Textarea
                id="message"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                required
                placeholder="Votre message..."
                className="min-h-[150px]"
              />
            </div>
            <Button type="submit" className="w-full">
              Envoyer le message
            </Button>
          </form>
        </motion.div>

        {/* Contact Information */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-8"
        >
          <div>
            <h2 className="text-2xl font-bold mb-6">Nous contacter</h2>
            <div className="space-y-4">
              {/* <div className="flex items-start gap-4">
                <Mail className="w-6 h-6 text-gray-600 mt-1" />
                <div>
                  <h3 className="font-semibold">Email</h3>
                  <p className="text-gray-600">contact@dressrental.com</p>
                </div>
              </div> */}
              <div className="flex items-start gap-4">
                <Phone className="w-6 h-6 text-gray-600 mt-1" />
                <div>
                  <h3 className="font-semibold">Téléphone</h3>
                  <p className="text-gray-600">58450691 - 52525004 - 54163121 - 53573573 - 53492492</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <MapPin className="w-6 h-6 text-gray-600 mt-1" />
                <div>
                  <h3 className="font-semibold">Adresses</h3>
                </div>
              </div>
            </div>
          </div>

          {/* Map */}
          <div className="w-full h-[450px] sm:h-[480px] rounded-lg overflow-hidden">
            <StateMap />
          </div>

          {/* Business Hours */}
          {/* <div>
            <h3 className="font-semibold mb-2">Business Hours</h3>
            <div className="space-y-1 text-gray-600">
              <p>Monday - Friday: 9:00 AM - 6:00 PM</p>
              <p>Saturday: 10:00 AM - 4:00 PM</p>
              <p>Sunday: Closed</p>
            </div>
          </div> */}
        </motion.div>
      </div>
    </div>
  );
}