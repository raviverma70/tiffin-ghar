import Link from "next/link";
import { providerFetch, requireProviderUser } from "@/lib/provider-api";
import { DAY_KEYS, MEAL_ICON, MEAL_KEY, MEAL_TIMES, type DashMenuItem } from "@/lib/provider";
import { formatPrice } from "@/lib/format";
import { photoSrc } from "@/lib/photo";
import { getT } from "@/i18n/server";
import DashNav from "@/components/dash-nav";
import ConfirmButton from "@/components/confirm-button";
import PhotoUploader from "@/components/photo-uploader";
import ItemForm from "./item-form";
import { deleteMenuItemAction, toggleAvailableAction } from "../actions";

const small = "rounded border px-3 py-1 text-sm hover:bg-orange-50";

export default async function MenuPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string; added?: string; notice?: string }>;
}) {
  const { edit, added, notice } = await searchParams;
  const { t } = await getT();

  await requireProviderUser("/dashboard/menu");

  const res = await providerFetch("/providers/me/menu", {
    mode: "page",
    returnTo: "/dashboard/menu",
  });
  const items = res.ok ? ((await res.json()) as DashMenuItem[]) : null;
  const editItem = edit && items ? items.find((i) => String(i.id) === edit) : undefined;

  return (
    <main className="mx-auto max-w-3xl px-4 py-6">
      <DashNav active="menu" />

      <h1 className="mt-6 text-2xl font-bold">{t("menu.title")}</h1>
      <p className="mt-1 text-sm text-gray-600">{t("menu.hint")}</p>

      {notice && <p className="mt-4 rounded border border-red-600 p-3 text-red-600">{notice}</p>}
      {added && !editItem && (
        <p className="mt-4 rounded border border-green-600 p-3 text-green-600">{t("menu.added")}</p>
      )}

      <h2 className="mt-6 text-lg font-semibold">
        {editItem ? t("menu.formEdit") : t("menu.formAdd")}
      </h2>
      <div className="mt-2">
        <ItemForm
          key={editItem ? `edit-${editItem.id}` : `new-${added ?? ""}`}
          item={editItem}
        />
        {editItem && (
          <p className="mt-2">
            <Link href="/dashboard/menu" className="text-orange-600">
              {t("menu.cancelEdit")}
            </Link>
          </p>
        )}
      </div>

      <h2 className="mt-8 text-lg font-semibold">{t("menu.all")}</h2>

      {!items && <p className="mt-4 text-red-600">{t("menu.loadFail")}</p>}
      {items && items.length === 0 && <p className="mt-4 text-gray-600">{t("menu.empty")}</p>}

      {items &&
        items.length > 0 &&
        MEAL_TIMES.map((meal) => {
          const group = items.filter((i) => i.mealTime === meal);
          if (group.length === 0) return null;
          return (
            <section key={meal} className="mt-6">
              <h3 className="flex items-center gap-2 text-base font-semibold text-gray-800">
                <span aria-hidden>{MEAL_ICON[meal]}</span> {t(MEAL_KEY[meal])}
                <span className="rounded-full bg-gray-100 px-2 text-xs font-medium text-gray-600">{group.length}</span>
              </h3>
        <ul className="mt-3 space-y-3">
          {group.map((item) => (
            <li key={item.id} className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-semibold">
                    <span
                      className={item.isVeg ? "text-green-600" : "text-red-600"}
                      title={item.isVeg ? t("of.veg") : t("of.nonveg")}
                    >
                      &#9679;
                    </span>{" "}
                    {item.name}
                  </p>
                  {item.description && (
                    <p className="mt-1 text-sm text-gray-600">{item.description}</p>
                  )}
                  <p className="mt-1 text-sm text-gray-600">
                    {item.dayOfWeek === null ? t("menu.everyDay") : t(DAY_KEYS[item.dayOfWeek])} -{" "}
                    {item.isAvailable ? t("menu.on") : t("menu.off")}
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
                  <button className={small}>
                    {item.isAvailable ? t("menu.turnOff") : t("menu.turnOn")}
                  </button>
                </form>

                <Link href={`/dashboard/menu?edit=${item.id}`} className={small}>
                  {t("common.edit")}
                </Link>

                <form action={deleteMenuItemAction}>
                  <input type="hidden" name="id" value={item.id} />
                  <ConfirmButton
                    message={t("menu.confirmDelete")}
                    className="rounded border border-red-600 px-3 py-1 text-sm text-red-600"
                  >
                    {t("common.remove")}
                  </ConfirmButton>
                </form>
              </div>
            </li>
          ))}
        </ul>
            </section>
          );
        })}
    </main>
  );
}
