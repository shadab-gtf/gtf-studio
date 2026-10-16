import { createElement, type ComponentProps } from "react";
import {
  ArrowRight as ArrowRightIcon,
  ArrowLeft as ArrowLeftIcon,
  ArrowUp as ArrowUpIcon,
  ArrowDown as ArrowDownIcon,
  ArrowRight2 as ChevronRightIcon,
  Add as PlusIcon,
  Minus as MinusIcon,
  CloseCircle as XIcon,
  TickCircle as CheckIcon,
  DocumentDownload as DownloadIcon,
  DocumentUpload as UploadIcon,
  Gallery as ImageIconIcon,
  Gallery as FileImageIcon,
  Folder as FolderIcon,
  FolderOpen as FolderOpenIcon,
  Home2 as HomeIcon,
  Setting2 as SettingsIcon,
  Setting4 as SlidersHorizontalIcon,
  Monitor as MonitorIcon,
  Mobile as SmartphoneIcon,
  Book1 as BookOpenIcon,
  ShieldTick as ShieldCheckIcon,
  SearchNormal1 as SearchIcon,
  Trash as Trash2Icon,
  Copy as CopyIcon,
  Archive as ArchiveIcon,
  More as MoreHorizontalIcon,
  HambergerMenu as MenuIcon,
  Grid2 as Grid2X2Icon,
  RowVertical as ListIcon,
  Element4 as LayoutTemplateIcon,
  Layer as LayersIcon,
  Text as TypeIcon,
  Shapes as ShapesIcon,
  Shapes1 as SquareIcon,
  RecordCircle as CircleIcon,
  Triangle as TriangleIcon,
  Star1 as StarIcon,
  Eye as EyeIcon,
  EyeSlash as EyeOffIcon,
  Lock as LockIcon,
  Unlock as UnlockIcon,
  ArrangeHorizontalSquare as GroupIcon,
  ArrangeVerticalSquare as UngroupIcon,
  ArrowRotateLeft as Undo2Icon,
  ArrowRotateRight as Redo2Icon,
  Refresh as RotateCcwIcon,
  Play as PlayIcon,
  PresentionChart as PresentationIcon,
  Maximize as MaximizeIcon,
  SidebarRight as PanelRightIcon,
  SliderHorizontal1 as PanelTopIcon,
  Warning2 as AlertCircleIcon,
  CloudCross as CloudOffIcon,
  MagicStar as SparklesIcon,
  Mouse as MousePointer2Icon,
  Share as ShareIcon,
  Sun1 as SunIcon,
  Moon as MoonIcon,
} from "iconsax-react";

// React 19 no longer applies function-component defaultProps. Keep the
// Iconsax defaults explicit so every stroke inherits the control color.
function withDefaults(Icon: typeof ArrowRightIcon) {
  return function StudioIcon(props: ComponentProps<typeof ArrowRightIcon>) {
    return createElement(Icon, {
      size: 32,
      color: "currentColor",
      variant: "Bulk",
      "aria-hidden": true,
      ...props,
    });
  };
}
export const ArrowRight = withDefaults(ArrowRightIcon);
export const ArrowLeft = withDefaults(ArrowLeftIcon);
export const ArrowUp = withDefaults(ArrowUpIcon);
export const ArrowDown = withDefaults(ArrowDownIcon);
export const ChevronRight = withDefaults(ChevronRightIcon);
export const Plus = withDefaults(PlusIcon);
export const Minus = withDefaults(MinusIcon);
export const X = withDefaults(XIcon);
export const Check = withDefaults(CheckIcon);
export const Download = withDefaults(DownloadIcon);
export const Upload = withDefaults(UploadIcon);
export const ImageIcon = withDefaults(ImageIconIcon);
export const FileImage = withDefaults(FileImageIcon);
export const Folder = withDefaults(FolderIcon);
export const FolderOpen = withDefaults(FolderOpenIcon);
export const Home = withDefaults(HomeIcon);
export const Settings = withDefaults(SettingsIcon);
export const SlidersHorizontal = withDefaults(SlidersHorizontalIcon);
export const Monitor = withDefaults(MonitorIcon);
export const Smartphone = withDefaults(SmartphoneIcon);
export const BookOpen = withDefaults(BookOpenIcon);
export const ShieldCheck = withDefaults(ShieldCheckIcon);
export const Search = withDefaults(SearchIcon);
export const Trash2 = withDefaults(Trash2Icon);
export const Copy = withDefaults(CopyIcon);
export const Archive = withDefaults(ArchiveIcon);
export const MoreHorizontal = withDefaults(MoreHorizontalIcon);
export const Menu = withDefaults(MenuIcon);
export const Grid2X2 = withDefaults(Grid2X2Icon);
export const List = withDefaults(ListIcon);
export const LayoutTemplate = withDefaults(LayoutTemplateIcon);
export const Layers = withDefaults(LayersIcon);
export const Type = withDefaults(TypeIcon);
export const Shapes = withDefaults(ShapesIcon);
export const Square = withDefaults(SquareIcon);
export const Circle = withDefaults(CircleIcon);
export const Triangle = withDefaults(TriangleIcon);
export const Star = withDefaults(StarIcon);
export const Eye = withDefaults(EyeIcon);
export const EyeOff = withDefaults(EyeOffIcon);
export const Lock = withDefaults(LockIcon);
export const Unlock = withDefaults(UnlockIcon);
export const Group = withDefaults(GroupIcon);
export const Ungroup = withDefaults(UngroupIcon);
export const Undo2 = withDefaults(Undo2Icon);
export const Redo2 = withDefaults(Redo2Icon);
export const RotateCcw = withDefaults(RotateCcwIcon);
export const Play = withDefaults(PlayIcon);
export const Presentation = withDefaults(PresentationIcon);
export const Maximize = withDefaults(MaximizeIcon);
export const PanelRight = withDefaults(PanelRightIcon);
export const PanelTop = withDefaults(PanelTopIcon);
export const AlertCircle = withDefaults(AlertCircleIcon);
export const CloudOff = withDefaults(CloudOffIcon);
export const Sparkles = withDefaults(SparklesIcon);
export const MousePointer2 = withDefaults(MousePointer2Icon);
export const Share = withDefaults(ShareIcon);
export const Sun = withDefaults(SunIcon);
export const Moon = withDefaults(MoonIcon);
