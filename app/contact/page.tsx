"use client";

import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import TurnstileWidget from '@/components/ui/TurnstileWidget';
import PageHero from '@/components/dss/PageHero';
import { Tile } from '@/components/dss/Tiles';
import { firm, workingWith } from '@/content/site';

const inputClass = "w-full rounded-lg bg-white/3 border border-brand-gold/25 px-3.5 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-brand-gold/70 transition-colors";
const labelClass = "text-xs font-bold text-white/70 block";

const regions = ['Middle East and Africa', 'Americas', 'Asia-Pacific', 'Europe', 'Other'];

const ContactPage: React.FC = () => {
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
    const [formData, setFormData] = useState({ fullName: '', email: '', organization: '', role: '', region: '', decisionContext: '' });

    const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = event.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        if (isSubmitting) return;
        setIsSubmitting(true);
        setError(null);
        try {
            if (!turnstileToken) {
                setError('Unable to verify request. Please try again.');
                setIsSubmitting(false);
                return;
            }
            const response = await fetch('/api/submit-contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData, turnstileToken }),
            });
            if (response.ok) {
                setIsSubmitted(true);
                setFormData({ fullName: '', email: '', organization: '', role: '', region: '', decisionContext: '' });
            } else {
                const contentType = response.headers.get('content-type') || '';
                let message = `The request could not be sent (${response.status}). Please try again.`;
                if (contentType.includes('application/json')) {
                    const data = await response.json();
                    if (data?.error) message = data.error;
                }
                setError(message);
            }
        } catch (err) {
            console.error('Error submitting contact form:', err);
            setError('The request could not be sent. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <PageHero eyebrow="A conversation about your decision" title="What needs to be understood" governing="before your next decision?" intro={firm.invitation.body} />

            <section className="pb-24">
                <div className="container-editorial">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
                        <div className="lg:col-span-5 space-y-5">
                            <Tile title="What the first conversation does" body="It establishes what you need to establish, decide or make workable, and what research, challenge or support would be useful in your circumstances. Sector, geography and business maturity refine the context; they do not, by themselves, determine fit." />
                            <Tile title={workingWith.fit.title} body={workingWith.fit.body} />
                            <div className="tile p-6">
                                <h3 className="text-base mb-3">Or write directly</h3>
                                <ul className="space-y-1.5 text-sm">
                                    <li><a href={`mailto:${firm.emails.quincy}`} className="text-white/75 hover:text-white">{firm.emails.quincy}</a> <span className="text-white/40">· Research Partner</span></li>
                                    <li><a href={`mailto:${firm.emails.joel}`} className="text-white/75 hover:text-white">{firm.emails.joel}</a> <span className="text-white/40">· Managing Partner, UAE</span></li>
                                    <li><a href={`mailto:${firm.emails.wayne}`} className="text-white/75 hover:text-white">{firm.emails.wayne}</a> <span className="text-white/40">· Partner — North America</span></li>
                                </ul>
                            </div>
                        </div>

                        <div className="lg:col-span-7">
                            <div className="tile p-8 md:p-10">
                                {error && (
                                    <div className="mb-6 bg-red-900/20 border border-red-500/30 rounded-lg p-4">
                                        <p className="text-red-200 text-sm">{error}</p>
                                    </div>
                                )}
                                {!isSubmitted ? (
                                    <form onSubmit={handleSubmit} className="space-y-5">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label htmlFor="fullName" className={labelClass}>Full name</label>
                                                <input id="fullName" name="fullName" value={formData.fullName} onChange={handleChange} required className={inputClass} placeholder="Your name" />
                                            </div>
                                            <div className="space-y-2">
                                                <label htmlFor="email" className={labelClass}>Work email</label>
                                                <input id="email" type="email" name="email" value={formData.email} onChange={handleChange} required className={inputClass} placeholder="you@organisation.com" />
                                            </div>
                                            <div className="space-y-2">
                                                <label htmlFor="organization" className={labelClass}>Organisation</label>
                                                <input id="organization" name="organization" value={formData.organization} onChange={handleChange} className={inputClass} placeholder="Organisation" />
                                            </div>
                                            <div className="space-y-2">
                                                <label htmlFor="role" className={labelClass}>Role</label>
                                                <input id="role" name="role" value={formData.role} onChange={handleChange} className={inputClass} placeholder="Role or title" />
                                            </div>
                                            <div className="space-y-2 md:col-span-2">
                                                <label htmlFor="region" className={labelClass}>Where are you based?</label>
                                                <select id="region" name="region" value={formData.region} onChange={handleChange} className={`${inputClass} bg-brand-navy`}>
                                                    <option value="">Select a region</option>
                                                    {regions.map((r) => <option key={r} value={r}>{r}</option>)}
                                                </select>
                                            </div>
                                        </div>
                                        <div className="space-y-2 pt-1">
                                            <label htmlFor="decisionContext" className={labelClass}>The proposition, question or direction</label>
                                            <textarea id="decisionContext" name="decisionContext" value={formData.decisionContext} onChange={handleChange} rows={5} required className={`${inputClass} resize-none`} placeholder="What are you working on, and what would need to be understood before you decide? Keep this high-level; share only what is necessary at this stage." />
                                        </div>
                                        <div className="pt-1"><TurnstileWidget onTokenChange={setTurnstileToken} /></div>
                                        <div className="pt-2 border-t border-brand-gold/15 flex flex-col sm:flex-row sm:items-center gap-4">
                                            <Button type="submit" variant="primary" size="md" icon={ArrowRight} disabled={isSubmitting}>
                                                {isSubmitting ? 'Sending…' : 'Send'}
                                            </Button>
                                            <p className="text-xs text-white/45">Client information stays within agreed disclosure boundaries.</p>
                                        </div>
                                    </form>
                                ) : (
                                    <div className="border border-brand-gold/30 rounded-xl p-6">
                                        <h3 className="text-2xl mb-3">Received.</h3>
                                        <p className="text-sm text-white/70">A partner will reply directly to define the support your situation requires.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
};

export default ContactPage;
