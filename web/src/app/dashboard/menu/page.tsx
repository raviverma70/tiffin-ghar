import Link from "next/link";
import { providerFetch, requireProviderUser } from "@/lib/provider-api";
import { DAY_NAMES, type DashMenuItem } from "@/lib/provider";
import { formatPrice } from "@/lib/format";
import DashNav from "@/components/dash-nav";
import ConfirmButton from "@/components/confirm-button";
import ItemForm from "./item-form";
import { deleteMenuItemAction, toggleAvailableAction } from "../actions";
import PhotoUploader from "@/components/photo-uploader";
import { photoSrc } from "@/lib/photo";

const small = "rounded border px-3 py-1 text-sm hover:bg-orange-50";

export default async function MenuPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string; added?: string; notice?: string }>;
}) {
  const { edit, added, notice } = await searchParams;

  await requireProviderUser("/dashboard/menu");

  const res = await providerFetch("/providers/me/menu", {
    mode: "page",
    returnTo: "/dashboard/menu",
  });
  const items = res.ok ? ((await res.json()) as DashMenuItem[]) : null;
  const editItem = edit && items ? items.find((i) => String(i.id) === edit) : undefined;

  return (
    <main className="mx-auto max-w-2xl p-6">
      <DashNav active="menu" />

      <h1 className="mt-6 text-2xl font-bold">Mera menu</h1>
      <p className="mt-1 text-sm text-gray-600">
        Customers ko sirf aaj ka menu dikhta hai: jis item ka din aaj ka ya &quot;Har din&quot; ho aur
        jo chalu ho.
      </p>

      {notice && <p className="mt-4 rounded border border-red-600 p-3 text-red-600">{notice}</p>}
      {added && !editItem && (
        <p className="mt-4 rounded border border-green-600 p-3 text-green-600">Item jud gaya.</p>
      )}

      <h2 className="mt-6 text-lg font-semibold">{editItem ? "Item badlo" : "Naya item jodo"}</h2>
      <div className="mt-2">
        <ItemForm
          key={editItem ? `edit-${editItem.id}` : `new-${added ?? ""}`}
          item={editItem}
        />
        {editItem && (
          <p className="mt-2">
            <Link href="/dashboard/menu" className="text-orange-600">
              Rehne do
            </Link>
          </p>
        )}
      </div>

      <h2 className="mt-8 text-lg font-semibold">Saare items</h2>

      {!items && <p className="mt-4 text-red-600">Menu nahi la paye, baad me try karo.</p>}
      {items && items.length === 0 && (
        <p className="mt-4 text-gray-600">Abhi koi item nahi hai. Upar se pehla item jodo.</p>
      )}

      {items && items.length > 0 && (
        <ul className="mt-4 space-y-3">
          {items.map((item) => (
                        <li key={item.id} className="rounded-xl border bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-semibold">
                    <span
                      className={item.isVeg ? "text-green-600" : "text-red-600"}
                      title={item.isVeg ? "Veg" : "Non-veg"}
                    >
                      &#9679;
                    </span>{" "}
                    {item.name}
                  </p>
                  {item.description && (
                    <p className="mt-1 text-sm text-gray-600">{item.description}</p>
                  )}
                  <p className="mt-1 text-sm text-gray-600">
                    {item.dayOfWeek === null ? "Har din" : DAY_NAMES[item.dayOfWeek]} -{" "}
                    {item.isAvailable ? "Chalu" : "Band"}
                  </p>
                </div>
                <p className="font-semibold">{formatPrice(item.pricePaise)}</p>
              </div>

              <div className="mt-3">
                <PhotoUploader kind="menu" itemId={item.id} src={photoSrc(item.photoUrl)} />
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                <form action={toggleAvailableAction}>
                  <input type="hidden" name="id" value={item.id} />
                  <input type="hidden" name="available" value={String(!item.isAvailable)} />
                  <button className={small}>{item.isAvailable ? "Band karo" : "Chalu karo"}</button>
                </form>

                <Link href={`/dashboard/menu?edit=${item.id}`} className={small}>
                  Badlo
                </Link>

                <form action={deleteMenuItemAction}>
                  <input type="hidden" name="id" value={item.id} />
                  <ConfirmButton
                    message="Ye item hata dein?"
                    className="rounded border border-red-600 px-3 py-1 text-sm text-red-600"
                  >
                    Hatao
                  </ConfirmButton>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}