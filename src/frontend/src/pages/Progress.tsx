import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Camera, Loader2, Plus, Scale, Upload } from "lucide-react";
import { motion } from "motion/react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { ExternalBlob } from "../backend";
import { useCamera } from "../camera/useCamera";
import {
  useAddBodyStats,
  useAddProgressPhoto,
  useAwardBadge,
  useGetMyBodyStats,
  useGetMyProgressPhotos,
} from "../hooks/useQueries";
import { formatShortDate } from "../lib/goalUtils";

function SimpleLineChart({
  data,
  label,
  color,
}: { data: number[]; label: string; color: string }) {
  if (data.length < 2) {
    return (
      <div className="flex items-center justify-center h-24 text-muted-foreground text-sm">
        Need more data points to show chart
      </div>
    );
  }
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const w = 300;
  const h = 80;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / range) * (h - 10) - 5;
    return `${x},${y}`;
  });
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-semibold">
          {data[data.length - 1]?.toFixed(1)}
        </span>
      </div>
      <svg
        viewBox={`0 0 ${w} ${h}`}
        className="w-full h-20"
        role="img"
        aria-label={`${label} chart`}
      >
        <title>{label} progress chart</title>
        <polyline
          points={pts.join(" ")}
          fill="none"
          stroke={color}
          strokeWidth="2.5"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {data.map((v, i) => {
          const x = (i / (data.length - 1)) * w;
          const y = h - ((v - min) / range) * (h - 10) - 5;
          return (
            <circle key={`pt-${x}-${y}`} cx={x} cy={y} r="3" fill={color} />
          );
        })}
      </svg>
    </div>
  );
}

export default function Progress() {
  const [statsForm, setStatsForm] = useState({
    weight: "",
    chest: "",
    waist: "",
    hips: "",
    arms: "",
    legs: "",
  });
  const [photoDialogOpen, setPhotoDialogOpen] = useState(false);
  const [photoNote, setPhotoNote] = useState("");
  const [photoWeight, setPhotoWeight] = useState("");
  const [useCameraMode, setUseCameraMode] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const { data: bodyStats, isLoading: loadingStats } = useGetMyBodyStats();
  const { data: photos, isLoading: loadingPhotos } = useGetMyProgressPhotos();
  const addStats = useAddBodyStats();
  const addPhoto = useAddProgressPhoto();
  const awardBadge = useAwardBadge();

  const cam = useCamera({ facingMode: "environment", quality: 0.8 });

  const handleSaveStats = async (e: React.FormEvent) => {
    e.preventDefault();
    const { weight, chest, waist, hips, arms, legs } = statsForm;
    if (!weight) {
      toast.error("Weight is required");
      return;
    }
    try {
      await addStats.mutateAsync({
        weight: Number.parseFloat(weight),
        chest: Number.parseFloat(chest) || 0,
        waist: Number.parseFloat(waist) || 0,
        hips: Number.parseFloat(hips) || 0,
        arms: Number.parseFloat(arms) || 0,
        legs: Number.parseFloat(legs) || 0,
      });
      toast.success("Body stats saved!");
      setStatsForm({
        weight: "",
        chest: "",
        waist: "",
        hips: "",
        arms: "",
        legs: "",
      });
    } catch {
      toast.error("Failed to save stats");
    }
  };

  const handlePhotoSubmit = async (blob: ExternalBlob | null) => {
    try {
      await addPhoto.mutateAsync({
        weight: Number.parseFloat(photoWeight) || 0,
        note: photoNote,
        blob,
      });
      await awardBadge.mutateAsync("Photo Uploaded");
      toast.success("Progress photo saved! 📸");
      setPhotoDialogOpen(false);
      setPhotoNote("");
      setPhotoWeight("");
      setUseCameraMode(false);
    } catch {
      toast.error("Failed to save photo");
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const bytes = new Uint8Array(await file.arrayBuffer());
    const blob = ExternalBlob.fromBytes(bytes).withUploadProgress((p) =>
      setUploadProgress(p),
    );
    await handlePhotoSubmit(blob);
  };

  const handleCameraCapture = async () => {
    const file = await cam.capturePhoto();
    if (!file) {
      toast.error("Failed to capture photo");
      return;
    }
    const bytes = new Uint8Array(await file.arrayBuffer());
    const blob = ExternalBlob.fromBytes(bytes).withUploadProgress((p) =>
      setUploadProgress(p),
    );
    await handlePhotoSubmit(blob);
  };

  const weightData = (bodyStats ?? []).map((s) => s.weight);
  const armsData = (bodyStats ?? []).map((s) => s.arms).filter((v) => v > 0);
  const latestStats = bodyStats?.[bodyStats.length - 1];

  const statFields = [
    { label: "Weight", value: latestStats?.weight, unit: "kg" },
    { label: "Chest", value: latestStats?.chest, unit: "cm" },
    { label: "Waist", value: latestStats?.waist, unit: "cm" },
    { label: "Hips", value: latestStats?.hips, unit: "cm" },
    { label: "Arms", value: latestStats?.arms, unit: "cm" },
    { label: "Legs", value: latestStats?.legs, unit: "cm" },
  ];

  return (
    <div
      data-ocid="progress.page"
      className="pb-nav px-4 pt-6 max-w-2xl mx-auto"
    >
      <div className="flex items-center justify-between mb-5">
        <h1 className="font-display text-2xl font-bold">Progress</h1>
        <Button
          data-ocid="progress.add_photo_button"
          size="sm"
          className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
          onClick={() => setPhotoDialogOpen(true)}
        >
          <Camera className="w-4 h-4" /> Add Photo
        </Button>
      </div>

      <Tabs defaultValue="stats">
        <TabsList className="w-full bg-secondary">
          <TabsTrigger
            data-ocid="progress.stats_tab"
            value="stats"
            className="flex-1"
          >
            📊 Stats
          </TabsTrigger>
          <TabsTrigger
            data-ocid="progress.photos_tab"
            value="photos"
            className="flex-1"
          >
            📸 Photos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="stats" className="space-y-5 mt-4">
          {loadingStats ? (
            <div data-ocid="progress.loading_state">
              <Skeleton className="h-32 w-full" />
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              {weightData.length > 1 && (
                <div className="gym-card p-4">
                  <h3 className="font-display font-semibold mb-3 flex items-center gap-2">
                    <Scale className="w-4 h-4 text-primary" /> Weight Progress
                  </h3>
                  <SimpleLineChart
                    data={weightData}
                    label="Weight (kg)"
                    color="oklch(0.72 0.19 42)"
                  />
                </div>
              )}
              {armsData.length > 1 && (
                <div className="gym-card p-4">
                  <h3 className="font-display font-semibold mb-3">
                    💪 Arms Progress
                  </h3>
                  <SimpleLineChart
                    data={armsData}
                    label="Arms (cm)"
                    color="oklch(0.65 0.22 150)"
                  />
                </div>
              )}
            </motion.div>
          )}

          <div className="gym-card p-5">
            <h3 className="font-display font-semibold mb-4">
              Log Body Measurements
            </h3>
            <form onSubmit={handleSaveStats} className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="stat-weight">Weight (kg) *</Label>
                <Input
                  id="stat-weight"
                  data-ocid="progress.weight_input"
                  type="number"
                  step="0.1"
                  placeholder="75.0"
                  value={statsForm.weight}
                  onChange={(e) =>
                    setStatsForm((p) => ({ ...p, weight: e.target.value }))
                  }
                  className="bg-secondary border-border"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="stat-chest">Chest (cm)</Label>
                  <Input
                    id="stat-chest"
                    data-ocid="progress.chest_input"
                    type="number"
                    placeholder="100"
                    value={statsForm.chest}
                    onChange={(e) =>
                      setStatsForm((p) => ({ ...p, chest: e.target.value }))
                    }
                    className="bg-secondary border-border"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="stat-waist">Waist (cm)</Label>
                  <Input
                    id="stat-waist"
                    type="number"
                    placeholder="80"
                    value={statsForm.waist}
                    onChange={(e) =>
                      setStatsForm((p) => ({ ...p, waist: e.target.value }))
                    }
                    className="bg-secondary border-border"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="stat-hips">Hips (cm)</Label>
                  <Input
                    id="stat-hips"
                    type="number"
                    placeholder="95"
                    value={statsForm.hips}
                    onChange={(e) =>
                      setStatsForm((p) => ({ ...p, hips: e.target.value }))
                    }
                    className="bg-secondary border-border"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="stat-arms">Arms (cm)</Label>
                  <Input
                    id="stat-arms"
                    type="number"
                    placeholder="35"
                    value={statsForm.arms}
                    onChange={(e) =>
                      setStatsForm((p) => ({ ...p, arms: e.target.value }))
                    }
                    className="bg-secondary border-border"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="stat-legs">Legs (cm)</Label>
                  <Input
                    id="stat-legs"
                    type="number"
                    placeholder="55"
                    value={statsForm.legs}
                    onChange={(e) =>
                      setStatsForm((p) => ({ ...p, legs: e.target.value }))
                    }
                    className="bg-secondary border-border"
                  />
                </div>
              </div>
              <Button
                type="submit"
                data-ocid="progress.save_stats_button"
                disabled={addStats.isPending}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
              >
                {addStats.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Measurements"
                )}
              </Button>
            </form>
          </div>

          {latestStats && (
            <div className="gym-card p-5">
              <h3 className="font-display font-semibold mb-3">
                Latest Measurements
              </h3>
              <div className="grid grid-cols-3 gap-3">
                {statFields.map((stat) => (
                  <div
                    key={stat.label}
                    className="bg-secondary/50 rounded-xl p-3 text-center"
                  >
                    <div className="font-display text-xl font-bold">
                      {stat.value != null && stat.value > 0
                        ? stat.value.toFixed(1)
                        : "—"}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {stat.label} ({stat.unit})
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="photos" className="mt-4">
          {loadingPhotos ? (
            <div className="grid grid-cols-2 gap-3">
              {["a", "b", "c", "d"].map((k) => (
                <Skeleton key={k} className="h-48 rounded-xl" />
              ))}
            </div>
          ) : (photos ?? []).length === 0 ? (
            <div
              data-ocid="progress.empty_state"
              className="gym-card p-8 text-center"
            >
              <div className="text-4xl mb-3">📸</div>
              <p className="text-muted-foreground">No progress photos yet.</p>
              <p className="text-sm text-muted-foreground mt-1">
                Track your body transformation visually.
              </p>
              <Button
                onClick={() => setPhotoDialogOpen(true)}
                className="mt-4 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Plus className="w-4 h-4 mr-2" /> Add First Photo
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {(photos ?? []).map((photo, i) => (
                <motion.div
                  key={`photo-${photo.dateTaken}`}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="relative rounded-xl overflow-hidden aspect-square bg-secondary"
                >
                  {photo.blob ? (
                    <img
                      src={photo.blob.getDirectURL()}
                      alt="Progress"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl">
                      📷
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                    <p className="text-white text-xs font-medium">
                      {formatShortDate(photo.dateTaken)}
                    </p>
                    <p className="text-white/80 text-xs">{photo.weight}kg</p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={photoDialogOpen} onOpenChange={setPhotoDialogOpen}>
        <DialogContent className="bg-card border-border max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-display">
              Add Progress Photo
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {!useCameraMode ? (
              <div className="grid grid-cols-2 gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="border-border h-20 flex-col gap-2"
                  onClick={() => setUseCameraMode(true)}
                >
                  <Camera className="w-6 h-6" />
                  <span className="text-sm">Take Photo</span>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  data-ocid="progress.upload_button"
                  className="border-border h-20 flex-col gap-2"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="w-6 h-6" />
                  <span className="text-sm">Upload File</span>
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </div>
            ) : (
              <div className="space-y-3">
                <div
                  className="relative rounded-xl overflow-hidden bg-secondary"
                  style={{ minHeight: 200 }}
                >
                  <video
                    ref={cam.videoRef}
                    playsInline
                    muted
                    className="w-full h-48 object-cover"
                  />
                  <canvas ref={cam.canvasRef} className="hidden" />
                  {cam.error && (
                    <p className="text-destructive text-sm p-3">
                      {cam.error.message}
                    </p>
                  )}
                </div>
                {!cam.isActive && !cam.isLoading && (
                  <Button
                    type="button"
                    onClick={cam.startCamera}
                    className="w-full bg-primary text-primary-foreground"
                  >
                    Start Camera
                  </Button>
                )}
                {cam.isActive && (
                  <Button
                    type="button"
                    onClick={handleCameraCapture}
                    disabled={addPhoto.isPending}
                    className="w-full bg-primary text-primary-foreground"
                  >
                    {addPhoto.isPending ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Camera className="mr-2 h-4 w-4" />
                    )}
                    Capture
                  </Button>
                )}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    cam.stopCamera();
                    setUseCameraMode(false);
                  }}
                  className="w-full border-border"
                >
                  Back
                </Button>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="photo-weight">Current Weight (kg)</Label>
              <Input
                id="photo-weight"
                type="number"
                placeholder="75.0"
                value={photoWeight}
                onChange={(e) => setPhotoWeight(e.target.value)}
                className="bg-secondary border-border"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="photo-note">Note (optional)</Label>
              <Textarea
                id="photo-note"
                placeholder="How are you feeling today?"
                value={photoNote}
                onChange={(e) => setPhotoNote(e.target.value)}
                className="bg-secondary border-border resize-none"
                rows={2}
              />
            </div>
            {uploadProgress > 0 && uploadProgress < 100 && (
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Uploading...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
