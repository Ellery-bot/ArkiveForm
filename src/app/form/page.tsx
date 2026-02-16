"use client";

import Link from "next/link";
import { useState, FormEvent } from "react";

export default function FormPage() {
 
  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center py-12">

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="card animate-fade-in">

          <div className="mt-10 pt-6 flex justify-center">
            <Link href="/" className="btn-secondary text-sm inline-block">
              ← Back to Home
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
