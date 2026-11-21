"use client";
import { parseContactPhone } from "@/domain/commerce/phone";
import type { CountryCode } from "libphonenumber-js/max";
import {
  useId,
  useRef,
  useState,
  useSyncExternalStore,
  type FormEvent,
} from "react";
import { useStorefront } from "../storefront-context";
import { Dialog } from "./dialog";
import { OrderItems, OrderTotals } from "./cart";
import { CheckoutPhone } from "./checkout-phone";

const compactQuery = "(max-width: 800px)";
function subscribeToLayout(listener: () => void) {
  const query = window.matchMedia(compactQuery);
  query.addEventListener("change", listener);
  return () => query.removeEventListener("change", listener);
}
const compactSnapshot = () => window.matchMedia(compactQuery).matches;
const serverSnapshot = () => false;

type ContactField = "firstName" | "lastName" | "email" | "phone";
const contactFields: {
  name: ContactField;
  type: string;
  autocomplete: string;
}[] = [
  { name: "firstName", type: "text", autocomplete: "given-name" },
  { name: "lastName", type: "text", autocomplete: "family-name" },
  { name: "email", type: "email", autocomplete: "email" },
  { name: "phone", type: "tel", autocomplete: "tel" },
];

export function Checkout() {
  const { t, openDialog, closeDialog, cartCount, money, total } = useStorefront(
    (state) => ({
      t: state.t,
      openDialog: state.openDialog,
      closeDialog: state.closeDialog,
      cartCount: state.cartCount,
      money: state.money,
      total: state.pricing.grandTotal,
    }),
  );
  const [values, setValues] = useState<Record<ContactField, string>>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });
  const compact = useSyncExternalStore(
    subscribeToLayout,
    compactSnapshot,
    serverSnapshot,
  );
  const [phoneCountry, setPhoneCountry] = useState<CountryCode>("PL");
  const [reviewOpen, setReviewOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [pickupNotice, setPickupNotice] = useState(false);
  const form = useRef<HTMLFormElement>(null);
  const pickup = useRef<HTMLButtonElement>(null);
  const id = useId();
  const phone = parseContactPhone(values.phone, phoneCountry);

  function invalid(name: ContactField) {
    const value = values[name].trim();
    if (!value) return true;
    if (name === "email") return !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    if (name === "phone") return phone?.country !== phoneCountry;
    return false;
  }
  // TODO(12) Замени тестовый сценарий вызовом POST /api/checkout после 08 и 11.
  // Вход — корзина, контакты с нормализованным phone.number, pickupPointId, язык и attemptId.
  // Выход — переход в Stripe либо понятная ошибка с возможностью повтора.
  // Проверь двойной клик, смену итоговой суммы и отмену с сохранением корзины.
  function submit(event: FormEvent) {
    event.preventDefault();
    setSubmitted(true);
    const firstInvalid = contactFields.find((field) => invalid(field.name));
    if (firstInvalid) {
      form.current
        ?.querySelector<HTMLInputElement>(`[name="${firstInvalid.name}"]`)
        ?.focus();
      return;
    }
    setPickupNotice(true);
    pickup.current?.focus();
  }
  return (
    <Dialog
      id="checkoutPanel"
      className="checkout-panel"
      labelledBy="checkoutTitle"
    >
      <div className="panel-top">
        <h2 id="checkoutTitle">{t("checkoutTitle")}</h2>
        <button
          type="button"
          className="icon-button close-button"
          aria-label={t("guideClose")}
          onClick={closeDialog}
        >
          ×
        </button>
      </div>
      <button
        className="text-button checkout-back"
        type="button"
        onClick={() => openDialog("cartPanel")}
      >
        ← {t("backToBag")}
      </button>
      {cartCount === 0 ? (
        <div className="cart-empty">
          <p>{t("cartEmpty")}</p>
          <button className="btn" type="button" onClick={closeDialog}>
            {t("continueShopping")}
          </button>
        </div>
      ) : (
        <div className="checkout-layout">
          <aside className="checkout-summary" aria-label={t("orderSummary")}>
            {compact ? (
              <button
                type="button"
                className="mobile-order-toggle"
                aria-expanded={reviewOpen}
                aria-controls={`${id}-review`}
                onClick={() => setReviewOpen((value) => !value)}
              >
                <span>
                  {t("orderSummary")} ({cartCount})
                </span>
                <strong>{money(total)}</strong>
                <span className="disclosure-chevron" aria-hidden="true" />
              </button>
            ) : (
              <h3>{t("orderSummary")}</h3>
            )}
            <div
              id={`${id}-review`}
              hidden={compact && !reviewOpen}
              className="checkout-order-content"
            >
              <OrderItems />
              <OrderTotals />
              <button
                type="button"
                className="text-button"
                onClick={() => openDialog("cartPanel")}
              >
                {t("editOrder")}
              </button>
            </div>
          </aside>
          <form
            ref={form}
            className="checkout-form"
            noValidate
            onSubmit={submit}
          >
            <section aria-labelledby="contactTitle">
              <h3 id="contactTitle">{t("contactDetails")}</h3>
              <p className="field-hint">{t("guestCheckout")}</p>
              <div className="contact-fields">
                {contactFields.map((field) =>
                  field.name === "phone" ? (
                    <CheckoutPhone
                      key={field.name}
                      id={`${id}-phone`}
                      country={phoneCountry}
                      value={values.phone}
                      invalid={submitted && invalid("phone")}
                      onCountryChange={setPhoneCountry}
                      onChange={(value) =>
                        setValues((current) => ({ ...current, phone: value }))
                      }
                    />
                  ) : (
                    <label
                      key={field.name}
                      htmlFor={`${id}-${field.name}`}
                      className={
                        field.name === "email" ? "contact-wide" : undefined
                      }
                    >
                      {t(field.name)}
                      <input
                        id={`${id}-${field.name}`}
                        name={field.name}
                        type={field.type}
                        autoComplete={field.autocomplete}
                        maxLength={field.name === "email" ? 254 : 100}
                        required
                        value={values[field.name]}
                        aria-invalid={submitted && invalid(field.name)}
                        aria-describedby={
                          submitted && invalid(field.name)
                            ? `${id}-${field.name}-error`
                            : undefined
                        }
                        onChange={(event) =>
                          setValues((current) => ({
                            ...current,
                            [field.name]: event.target.value,
                          }))
                        }
                      />
                      {submitted && invalid(field.name) && (
                        <span
                          id={`${id}-${field.name}-error`}
                          className="field-error"
                        >
                          {t(
                            field.name === "email"
                              ? "validEmail"
                              : "requiredField",
                          )}
                        </span>
                      )}
                    </label>
                  ),
                )}
              </div>
            </section>
            <section
              className="delivery-section"
              aria-labelledby="deliveryTitle"
            >
              <h3 id="deliveryTitle">{t("deliveryTitle")}</h3>
              <p>{t("pickupDescription")}</p>
              <button
                ref={pickup}
                className="pickup-button"
                type="button"
                onClick={() => setPickupNotice(true)}
              >
                <span className="inpost-name">InPost</span>
                <span>{t("choosePickupPoint")}</span>
                <span aria-hidden="true">→</span>
              </button>
              {pickupNotice && (
                <p className="integration-notice" role="status">
                  {t("pickupPreviewNotice")}
                </p>
              )}
            </section>
            <div className="checkout-submit">
              <button className="btn" type="submit">
                <span>{t("continuePayment")}</span>
                <span className="checkout-payment-total">{money(total)}</span>
              </button>
              <p className="field-hint">{t("checkoutPreviewNotice")}</p>
            </div>
          </form>
        </div>
      )}
    </Dialog>
  );
}
