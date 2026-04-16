"use client";

import { useState, type FormEvent } from "react";
import type { RegistryItem } from "@/lib/db-types";
import { Modal, Alert } from "@/components/ui";

const iconMap: Record<string, string> = {
  amazon: "??",
  target: "??",
  "crate & barrel": "??",
  "williams sonoma": "??",
  honeyfund: "??",
  zola: "??",
};

export default function RegistryList({ items }: { items: RegistryItem[] }) {
  const [selectedItem, setSelectedItem] = useState<RegistryItem | null>(null);
  const [amount, setAmount] = useState("");
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formError, setFormError] = useState("");

  const activeItems = items.filter(i => i.status === "active");

  const stores = activeItems.filter(i => i.itemType === "store");
  const funds = activeItems.filter(i => i.itemType === "fund");
  const products = activeItems.filter(i => i.itemType === "product");

  async function handleContribute(e: FormEvent) {
    e.preventDefault();
    if (!selectedItem) return;
    
    if (!guestName.trim()) {
      setFormError("Please enter your name so we can thank you!");
      return;
    }
    
    setFormError("");
    setLoading(true);
    
    try {
      const contributionAmount = selectedItem.itemType === 'fund' ? parseFloat(amount) : 1;
      
      const res = await fetch(`/api/v1/registry/contribute`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          id: selectedItem.id, 
          amount: contributionAmount,
          guestName: guestName,
          guestEmail: guestEmail 
        }),
      });
      
      if (res.ok) {
        setSuccess(true);
        setTimeout(() => {
          if (selectedItem.url) {
            window.open(selectedItem.url, "_blank", "noopener,noreferrer");
          }
          window.location.reload();
        }, 1500);
      } else {
        const errorData = await res.json();
        setFormError(errorData.error || "An error occurred. Please try again.");
      }
    } catch (e) {
      console.error(e);
      setFormError("A network error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-16">
      {/* Stores */}
      {stores.length > 0 && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {stores.map((registry) => (
            <div key={registry.id} className="card-celestial text-center group hover:scale-[1.03] transition-all duration-300">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-royal/50 border-2 border-gold/20 flex items-center justify-center overflow-hidden">
                {registry.iconUrl ? (
                  <img src={registry.iconUrl} alt={registry.name} className="w-12 h-12 object-contain" />
                ) : (
                  <span className="text-3xl">{iconMap[registry.name.toLowerCase()] || "??"}</span>
                )}
              </div>
              <h3 className="text-gold font-serif text-xl mb-2">{registry.name}</h3>
              {registry.description && <p className="text-sm text-ivory/70 mb-4">{registry.description}</p>}
              <a href={registry.url} target="_blank" rel="noopener noreferrer" className="btn-gold inline-block text-sm px-6 py-2">
                Shop Registry
              </a>
            </div>
          ))}
        </div>
      )}

      {/* Funds */}
      {funds.length > 0 && (
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-serif text-gold text-center mb-8">Cash Funds</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {funds.map((fund) => (
              <div key={fund.id} className="card-celestial">
                <div className="flex gap-4 items-start">
                  <div className="w-12 h-12 rounded-full bg-royal/50 border border-gold/20 flex items-center justify-center flex-shrink-0 text-2xl">
                    {fund.iconUrl ? <img src={fund.iconUrl} alt="" className="w-8 h-8 object-contain" /> : "??"}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-gold font-serif text-xl mb-1">{fund.name}</h3>
                    {fund.description && <p className="text-sm text-ivory/70 mb-3">{fund.description}</p>}
                    
                    {fund.goalAmount ? (
                      <div className="mb-4">
                        <div className="flex justify-between text-xs text-ivory/60 mb-1">
                          <span>${fund.raisedAmount.toLocaleString()} raised</span>
                          <span>${fund.goalAmount.toLocaleString()} goal</span>
                        </div>
                        <div className="w-full bg-royal/50 rounded-full h-2">
                          <div 
                            className="bg-gold h-2 rounded-full transition-all duration-1000" 
                            style={{ width: `${Math.min(100, (fund.raisedAmount / fund.goalAmount) * 100)}%` }}
                          />
                        </div>
                      </div>
                    ) : null}
                    
                    <button 
                      onClick={() => { setSelectedItem(fund); setAmount(""); setGuestName(""); setGuestEmail(""); setSuccess(false); setFormError(""); }}
                      className="btn-gold text-sm px-6 py-2 w-full mt-2 disabled:opacity-50"
                      disabled={fund.goalAmount !== null && fund.raisedAmount >= fund.goalAmount}
                    >
                      {fund.goalAmount !== null && fund.raisedAmount >= fund.goalAmount ? "Fully Funded ??" : "Contribute"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Specific Products */}
      {products.length > 0 && (
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-serif text-gold text-center mb-8">Specific Items</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product) => {
              const totalNeeded = product.totalNeeded || 1;
              const totalBought = product.totalBought || 0;
              const isFulfilled = totalBought >= totalNeeded;

              return (
                <div key={product.id} className="card-celestial text-center flex flex-col items-center">
                  <div className="w-24 h-24 mb-4 bg-royal/30 rounded-lg flex items-center justify-center p-2">
                    {product.iconUrl ? (
                      <img src={product.iconUrl} alt="" className="max-w-full max-h-full object-contain" />
                    ) : (
                      <span className="text-4xl">???</span>
                    )}
                  </div>
                  <h3 className="text-gold font-serif text-lg mb-1">{product.name}</h3>
                  {product.price && <p className="text-ivory font-medium mb-1">${product.price.toLocaleString()}</p>}
                  {product.description && <p className="text-sm text-ivory/70 mb-3 flex-1">{product.description}</p>}
                  
                  <div className="text-xs text-ivory/60 mb-4 px-3 py-1 bg-royal/50 rounded-full">
                    {totalBought} of {totalNeeded} purchased
                  </div>

                  <button 
                    onClick={() => { setSelectedItem(product); setGuestName(""); setGuestEmail(""); setSuccess(false); setFormError(""); }}
                    className="btn-gold text-sm px-6 py-2 w-full mt-auto"
                    disabled={isFulfilled}
                  >
                    {isFulfilled ? "Purchased ??" : "Mark as Purchased"}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Contribution Modal */}
      {selectedItem && (
        <Modal title={selectedItem.itemType === 'fund' ? "Contribute to Fund" : "Confirm Purchase"} onClose={() => setSelectedItem(null)}>
          {success ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">??</div>
              <h3 className="text-gold font-serif text-xl mb-2">Thank you!</h3>
              <p className="text-ivory/70">
                {selectedItem.itemType === 'fund' ? 
                  "Redirecting to payment link..." : 
                  "We've marked this as purchased. Thank you for taking the time to bless us!"
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-center mb-6">
                <h3 className="text-lg text-ivory font-medium">{selectedItem.name}</h3>
                {selectedItem.itemType === 'fund' && (
                  <p className="text-sm text-ivory/70 mt-1">You will be redirected to complete your contribution.</p>
                )}
              </div>

              {formError && <Alert type="error" message={formError} className="mb-4" />}

              <form onSubmit={handleContribute} className="space-y-4">
                <div>
                  <label className="block text-ivory/70 text-sm mb-2">Your Name *</label>
                  <input
                    type="text"
                    required
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    className="input-celestial w-full"
                    placeholder="Jane & John Doe"
                  />
                </div>
                <div>
                  <label className="block text-ivory/70 text-sm mb-2">Your Email (Optional)</label>
                  <input
                    type="email"
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                    className="input-celestial w-full"
                    placeholder="email@example.com"
                  />
                </div>

                {selectedItem.itemType === 'fund' && (
                  <div>
                    <label className="block text-ivory/70 text-sm mb-2">Contribution Amount ($) *</label>
                    <input
                      type="number"
                      required
                      min="1"
                      step="1"
                      max={selectedItem.goalAmount ? selectedItem.goalAmount - selectedItem.raisedAmount : undefined}
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="input-celestial w-full text-lg"
                      placeholder="50"
                    />
                    {selectedItem.goalAmount && (
                      <p className="text-xs text-ivory/50 mt-1">
                        Remaining: ${(selectedItem.goalAmount - selectedItem.raisedAmount).toLocaleString()} of ${selectedItem.goalAmount.toLocaleString()} goal
                      </p>
                    )}
                  </div>
                )}

                {selectedItem.itemType === 'product' && (
                  <div className="bg-royal/30 p-4 rounded-lg text-center">
                    <p className="text-sm text-ivory/70">
                      Please click continue to log your intent to purchase{selectedItem.url ? " — you will be redirected to buy it directly" : ""}!
                    </p>
                    {selectedItem.totalNeeded && (
                      <p className="text-xs text-ivory/50 mt-2">
                        {selectedItem.totalBought} of {selectedItem.totalNeeded} already purchased
                      </p>
                    )}
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <button 
                    type="submit"
                    disabled={loading || (selectedItem.itemType === 'fund' && !amount)}
                    className="btn-gold flex-1 py-3 disabled:opacity-50"
                  >
                    {loading ? "Processing..." : "Continue"}
                  </button>
                  <button type="button" onClick={() => setSelectedItem(null)} className="btn-outline flex-1 py-3">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}
        </Modal>
      )}
    </div>
  );
}
