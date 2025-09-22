import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CreditCard, Bitcoin, Copy, ExternalLink, Heart, MapPin, Thermometer, Calendar, Sparkles, TrendingUp, QrCode, Wallet } from 'lucide-react';
import { ClimateAction, Category, DonationMethod, ShoppingItem } from '../backend';
import { useIsStripeConfigured, useCreateCheckoutSession, useMakeDonation, useGetDonationsBySubmission, useClimateActionPhoto } from '../hooks/useQueries';
import { toast } from 'sonner';

interface DonationModalProps {
  isOpen: boolean;
  onClose: () => void;
  submission: ClimateAction;
}

export default function DonationModal({ isOpen, onClose, submission }: DonationModalProps) {
  const [donationAmount, setDonationAmount] = useState('10');
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [isProcessing, setIsProcessing] = useState(false);

  const { data: isStripeConfigured = false } = useIsStripeConfigured();
  const { data: photoUrl } = useClimateActionPhoto(submission.photoPath);
  const { data: existingDonations = [] } = useGetDonationsBySubmission(submission.id);
  const createCheckoutSession = useCreateCheckoutSession();
  const makeDonation = useMakeDonation();

  // Check if user provided a wallet address for crypto donations
  const hasUserWallet = !!submission.walletAddress;

  const getCategoryLabel = (category: Category) => {
    switch (category) {
      case Category.treePlanting: return '🌱 Tree Planting';
      case Category.cleanup: return '🧹 Cleanup';
      case Category.renewableEnergy: return '⚡ Renewable Energy';
      case Category.awarenessEvent: return '📢 Awareness Event';
      default: return category;
    }
  };

  const getCategoryColor = (category: Category) => {
    switch (category) {
      case Category.treePlanting: return 'bg-forest-100 text-forest-800 dark:bg-forest-900 dark:text-forest-200';
      case Category.cleanup: return 'bg-ocean-100 text-ocean-800 dark:bg-ocean-900 dark:text-ocean-200';
      case Category.renewableEnergy: return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case Category.awarenessEvent: return 'bg-earth-100 text-earth-800 dark:bg-earth-900 dark:text-earth-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const formatLocationWithCoordinates = (coordinates: { latitude: number; longitude: number; latitudeDirection: string; longitudeDirection: string; areaName: string }) => {
    const formattedCoords = `${coordinates.latitude.toFixed(4)}° ${coordinates.latitudeDirection}, ${coordinates.longitude.toFixed(4)}° ${coordinates.longitudeDirection}`;
    return `${coordinates.areaName}, ${formattedCoords}`;
  };

  const totalDonations = existingDonations.reduce((sum, donation) => sum + donation.amount, 0);

  const handleStripePayment = async () => {
    if (!isStripeConfigured) {
      toast.error('Stripe payments are not configured yet');
      return;
    }

    const amount = parseFloat(donationAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid donation amount');
      return;
    }

    setIsProcessing(true);
    try {
      const shoppingItems: ShoppingItem[] = [
        {
          productName: `Donation for Climate Action: ${submission.description.substring(0, 50)}...`,
          productDescription: `Support climate action in ${submission.coordinates.areaName} by ${submission.userDisplayName}`,
          priceInCents: BigInt(Math.round(amount * 100)), // Convert to cents
          quantity: BigInt(1),
          currency: selectedCurrency,
        },
      ];

      const session = await createCheckoutSession.mutateAsync(shoppingItems);
      
      // Record the donation attempt
      await makeDonation.mutateAsync({
        amount,
        currency: selectedCurrency,
        method: DonationMethod.stripe,
        submissionId: submission.id,
        transactionId: session.id,
      });

      // Redirect to Stripe checkout
      window.location.href = session.url;
    } catch (error) {
      console.error('Stripe payment error:', error);
      toast.error('Failed to process payment. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopyWalletAddress = async (address: string) => {
    try {
      await navigator.clipboard.writeText(address);
      toast.success('Wallet address copied to clipboard');
    } catch (error) {
      toast.error('Failed to copy address');
    }
  };

  const generateQRCodeUrl = (address: string) => {
    // Generate QR code URL using a free service
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(address)}`;
  };

  const detectWalletType = (address: string) => {
    // Basic detection of wallet type
    if (address.startsWith('bc1') || address.startsWith('1') || address.startsWith('3')) {
      return 'Bitcoin';
    } else if (address.startsWith('0x')) {
      return 'Ethereum';
    }
    return 'Cryptocurrency';
  };

  const handleCryptoInstructions = (walletType: string) => {
    toast.info(`Send your ${walletType} donation to the address above. The transaction will be recorded once confirmed on the blockchain.`);
  };

  // Show donation button only if Stripe is configured OR user has provided wallet address
  const showDonationOptions = isStripeConfigured || hasUserWallet;

  if (!showDonationOptions) {
    return null; // Don't render the modal if no donation options are available
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-900 border-2 border-forest-300 dark:border-forest-700 shadow-2xl">
        {/* Header Section - Solid background for better readability */}
        <DialogHeader className="bg-forest-50 dark:bg-forest-900 -m-6 mb-6 p-6 rounded-t-lg border-b border-forest-200 dark:border-forest-800">
          <DialogTitle className="flex items-center gap-3 text-2xl font-bold text-forest-900 dark:text-forest-100">
            <div className="p-2 bg-red-500 rounded-lg shadow-lg">
              <Heart className="w-6 h-6 text-white" />
            </div>
            Support Climate Action
          </DialogTitle>
          <DialogDescription className="text-lg text-forest-700 dark:text-forest-300 mt-2">
            Make a donation to support this climate action initiative and help create positive environmental impact
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-2">
          {/* Left Column - Submission Details */}
          <div className="space-y-6">
            {/* Main Details Card */}
            <Card className="border-2 border-forest-200 dark:border-forest-800 shadow-lg">
              <CardHeader className="bg-forest-100 dark:bg-forest-900 border-b border-forest-200 dark:border-forest-800">
                <CardTitle className="text-xl flex items-center gap-2 text-forest-900 dark:text-forest-100">
                  <Sparkles className="w-5 h-5 text-forest-600 dark:text-forest-400" />
                  Climate Action Details
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 bg-white dark:bg-gray-900">
                {photoUrl && (
                  <div className="aspect-video rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 shadow-md mb-4">
                    <img
                      src={photoUrl}
                      alt="Climate action"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                
                <div className="space-y-4">
                  <p className="text-base text-gray-900 dark:text-gray-100 leading-relaxed font-medium">
                    {submission.description}
                  </p>
                  
                  {/* Information Grid */}
                  <div className="grid grid-cols-1 gap-3">
                    <div className="flex items-center gap-3 p-3 bg-ocean-50 dark:bg-ocean-900 rounded-lg border border-ocean-200 dark:border-ocean-800">
                      <MapPin className="w-5 h-5 text-ocean-600 dark:text-ocean-400 flex-shrink-0" />
                      <span className="text-sm text-gray-900 dark:text-gray-100 font-medium">
                        {formatLocationWithCoordinates(submission.coordinates)}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 bg-orange-50 dark:bg-orange-900 rounded-lg border border-orange-200 dark:border-orange-800">
                      <Thermometer className="w-5 h-5 text-orange-600 dark:text-orange-400 flex-shrink-0" />
                      <span className="text-sm text-gray-900 dark:text-gray-100 font-medium">
                        Temperature: {submission.temperature}°C
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 bg-sky-50 dark:bg-sky-900 rounded-lg border border-sky-200 dark:border-sky-800">
                      <Calendar className="w-5 h-5 text-sky-600 dark:text-sky-400 flex-shrink-0" />
                      <span className="text-sm text-gray-900 dark:text-gray-100 font-medium">
                        {new Date(Number(submission.timestamp) / 1000000).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  
                  {submission.weatherNotes && (
                    <div className="p-4 bg-sky-50 dark:bg-sky-900 rounded-lg border border-sky-200 dark:border-sky-800">
                      <p className="text-sm text-gray-900 dark:text-gray-100">
                        <strong className="text-sky-700 dark:text-sky-300">Weather Notes:</strong> "{submission.weatherNotes}"
                      </p>
                    </div>
                  )}
                  
                  <div className="flex flex-wrap gap-2 pt-2">
                    <Badge className={`text-sm font-medium ${getCategoryColor(submission.category)}`}>
                      {getCategoryLabel(submission.category)}
                    </Badge>
                  </div>
                  
                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      Climate action by <span className="font-bold text-forest-600 dark:text-forest-400">{submission.userDisplayName}</span>
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Donation Statistics */}
            {existingDonations.length > 0 && (
              <Card className="border-2 border-green-200 dark:border-green-800 shadow-lg">
                <CardHeader className="bg-green-100 dark:bg-green-900 border-b border-green-200 dark:border-green-800">
                  <CardTitle className="text-xl flex items-center gap-2 text-green-900 dark:text-green-100">
                    <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                    Donation Impact
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 bg-white dark:bg-gray-900">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-green-50 dark:bg-green-900 rounded-lg border border-green-200 dark:border-green-800">
                      <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                        ${totalDonations.toFixed(2)}
                      </div>
                      <div className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                        Total Donations
                      </div>
                    </div>
                    <div className="text-center p-4 bg-blue-50 dark:bg-blue-900 rounded-lg border border-blue-200 dark:border-blue-800">
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {existingDonations.length}
                      </div>
                      <div className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                        Supporters
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Donation Options */}
          <div className="space-y-6">
            <Card className="border-2 border-forest-200 dark:border-forest-800 shadow-lg">
              <CardHeader className="bg-forest-100 dark:bg-forest-900 border-b border-forest-200 dark:border-forest-800">
                <CardTitle className="text-xl text-forest-900 dark:text-forest-100">
                  Choose Donation Method
                </CardTitle>
                <CardDescription className="text-forest-700 dark:text-forest-300">
                  Select your preferred payment method below
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 bg-white dark:bg-gray-900">
                <Tabs defaultValue={isStripeConfigured ? "stripe" : "crypto"} className="w-full">
                  <TabsList className="grid w-full grid-cols-2 bg-gray-100 dark:bg-gray-800 p-1">
                    <TabsTrigger 
                      value="stripe" 
                      disabled={!isStripeConfigured}
                      className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:text-gray-900 dark:data-[state=active]:text-gray-100 font-medium"
                    >
                      <CreditCard className="w-4 h-4 mr-2" />
                      Credit Card
                    </TabsTrigger>
                    <TabsTrigger 
                      value="crypto" 
                      disabled={!hasUserWallet}
                      className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:text-gray-900 dark:data-[state=active]:text-gray-100 font-medium"
                    >
                      <Bitcoin className="w-4 h-4 mr-2" />
                      Cryptocurrency
                    </TabsTrigger>
                  </TabsList>

                  {/* Stripe Payment Tab */}
                  <TabsContent value="stripe" className="mt-6">
                    {!isStripeConfigured ? (
                      <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                        <CreditCard className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-lg text-gray-700 dark:text-gray-300 mb-2 font-medium">
                          Credit card payments are not configured yet.
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Please contact the administrator to set up Stripe payments.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="amount" className="text-base font-medium text-gray-900 dark:text-gray-100">
                              Amount
                            </Label>
                            <Input
                              id="amount"
                              type="number"
                              min="1"
                              step="0.01"
                              value={donationAmount}
                              onChange={(e) => setDonationAmount(e.target.value)}
                              placeholder="10.00"
                              className="text-lg p-3 border-2 border-gray-300 dark:border-gray-600 focus:border-forest-500 dark:focus:border-forest-400"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="currency" className="text-base font-medium text-gray-900 dark:text-gray-100">
                              Currency
                            </Label>
                            <select
                              id="currency"
                              value={selectedCurrency}
                              onChange={(e) => setSelectedCurrency(e.target.value)}
                              className="flex h-12 w-full rounded-md border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-lg text-gray-900 dark:text-gray-100 focus:border-forest-500 dark:focus:border-forest-400 focus:outline-none"
                            >
                              <option value="USD">USD</option>
                              <option value="EUR">EUR</option>
                              <option value="GBP">GBP</option>
                            </select>
                          </div>
                        </div>
                        
                        <Button
                          onClick={handleStripePayment}
                          disabled={isProcessing || createCheckoutSession.isPending}
                          className="w-full bg-forest-600 hover:bg-forest-700 text-white text-lg py-6 font-semibold shadow-lg"
                        >
                          {isProcessing || createCheckoutSession.isPending ? (
                            <div className="flex items-center gap-2">
                              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              Processing...
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <Heart className="w-5 h-5" />
                              Donate ${donationAmount} {selectedCurrency}
                            </div>
                          )}
                        </Button>
                      </div>
                    )}
                  </TabsContent>

                  {/* Crypto Payment Tab */}
                  <TabsContent value="crypto" className="mt-6">
                    {!hasUserWallet ? (
                      <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                        <Wallet className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-lg text-gray-700 dark:text-gray-300 mb-2 font-medium">
                          Cryptocurrency donations are not available for this submission.
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          The creator of this climate action did not provide a cryptocurrency wallet address.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {/* QR Code Section */}
                        <div className="text-center">
                          <div className="inline-block p-4 bg-white rounded-lg shadow-md border border-gray-200">
                            <img
                              src={generateQRCodeUrl(submission.walletAddress!)}
                              alt={`${detectWalletType(submission.walletAddress!)} QR Code`}
                              className="w-32 h-32 border rounded-lg"
                            />
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 font-medium">
                            Scan QR code to send {detectWalletType(submission.walletAddress!)}
                          </p>
                        </div>
                        
                        {/* Wallet Address Section */}
                        <div className="space-y-3">
                          <Label className="text-base font-medium text-gray-900 dark:text-gray-100 flex items-center gap-2">
                            <Wallet className="w-4 h-4" />
                            {submission.userDisplayName}'s {detectWalletType(submission.walletAddress!)} Address
                          </Label>
                          <div className="flex gap-2">
                            <Input
                              value={submission.walletAddress!}
                              readOnly
                              className="font-mono text-sm bg-gray-50 dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600"
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleCopyWalletAddress(submission.walletAddress!)}
                              className="border-2 border-forest-300 dark:border-forest-700 hover:bg-forest-50 dark:hover:bg-forest-900"
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        
                        {/* Action Buttons */}
                        <div className="grid grid-cols-2 gap-3">
                          <Button
                            variant="outline"
                            onClick={() => handleCryptoInstructions(detectWalletType(submission.walletAddress!))}
                            className="border-2 border-ocean-300 dark:border-ocean-700 hover:bg-ocean-50 dark:hover:bg-ocean-900 text-ocean-700 dark:text-ocean-300"
                          >
                            <QrCode className="w-4 h-4 mr-2" />
                            Instructions
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => {
                              const walletType = detectWalletType(submission.walletAddress!);
                              const explorerUrl = walletType === 'Bitcoin' 
                                ? `https://blockchair.com/bitcoin/address/${submission.walletAddress}`
                                : `https://etherscan.io/address/${submission.walletAddress}`;
                              window.open(explorerUrl, '_blank');
                            }}
                            className="border-2 border-earth-300 dark:border-earth-700 hover:bg-earth-50 dark:hover:bg-earth-900 text-earth-700 dark:text-earth-300"
                          >
                            <ExternalLink className="w-4 h-4 mr-2" />
                            Explorer
                          </Button>
                        </div>

                        {/* Important Notice */}
                        <div className="p-4 bg-yellow-50 dark:bg-yellow-900 rounded-lg border-2 border-yellow-200 dark:border-yellow-800">
                          <div className="space-y-3">
                            <p className="font-semibold text-base flex items-center gap-2 text-yellow-800 dark:text-yellow-200">
                              <Sparkles className="w-4 h-4" />
                              Direct Donation to Creator
                            </p>
                            <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1 list-disc list-inside">
                              <li>This donation goes directly to {submission.userDisplayName}'s wallet</li>
                              <li>Send only {detectWalletType(submission.walletAddress!)} to this address</li>
                              <li>Double-check the address before sending</li>
                              <li>Transactions are irreversible</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Footer Section */}
        <div className="mt-8 pt-6 border-t-2 border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <p className="text-base text-gray-700 dark:text-gray-300 flex items-center gap-2 font-medium">
              <Heart className="w-5 h-5 text-red-500" />
              Your donation helps support climate action initiatives worldwide
            </p>
            <Button 
              variant="outline" 
              onClick={onClose}
              className="border-2 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 px-6 py-2 font-medium"
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
